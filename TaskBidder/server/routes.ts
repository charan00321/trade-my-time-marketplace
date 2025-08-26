import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { bids } from "@shared/schema";
import { eq } from "drizzle-orm";

// Stripe integration will be added later when keys are provided
let stripe: any = null;

// WebSocket connections store
const wsConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getWorkerStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        customerId: userId,
      });
      
      const task = await storage.createTask(validatedData);
      
      // Broadcast new task to connected workers
      const message = JSON.stringify({
        type: 'NEW_TASK',
        data: await storage.getTask(task.id)
      });
      
      wsConnections.forEach((ws, connectionUserId) => {
        if (ws.readyState === WebSocket.OPEN && connectionUserId !== userId) {
          ws.send(message);
        }
      });
      
      res.json(task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/tasks/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByCustomer(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/open', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const tasks = await storage.getOpenTasks(limit);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching open tasks:", error);
      res.status(500).json({ message: "Failed to fetch open tasks" });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.patch('/api/tasks/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      // Validate user owns the task or is assigned worker
      const task = await storage.getTask(req.params.id);
      if (!task || (task.customerId !== userId && task.workerId !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedTask = await storage.updateTaskStatus(req.params.id, status);
      
      // Broadcast task update
      const message = JSON.stringify({
        type: 'TASK_STATUS_UPDATE',
        data: { taskId: req.params.id, status }
      });
      
      wsConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
      
      res.json(updatedTask);
    } catch (error: any) {
      console.error("Error updating task status:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Bid routes
  app.post('/api/bids', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBidSchema.parse({
        ...req.body,
        workerId: userId,
      });
      
      const bid = await storage.createBid(validatedData);
      
      // Get task to notify customer
      const task = await storage.getTask(validatedData.taskId);
      if (task) {
        const message = JSON.stringify({
          type: 'NEW_BID',
          data: { taskId: task.id, bid }
        });
        
        // Send to task owner
        const customerWs = wsConnections.get(task.customerId);
        if (customerWs && customerWs.readyState === WebSocket.OPEN) {
          customerWs.send(message);
        }
      }
      
      res.json(bid);
    } catch (error: any) {
      console.error("Error creating bid:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/tasks/:taskId/bids', isAuthenticated, async (req: any, res) => {
    try {
      const bids = await storage.getBidsForTask(req.params.taskId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post('/api/bids/:bidId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bidId = req.params.bidId;
      
      // Get bid details to find task
      const bids = await db.select().from(bids).where(eq(bids.id, bidId));
      if (bids.length === 0) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      const bid = bids[0];
      const task = await storage.getTask(bid.taskId);
      
      if (!task || task.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const result = await storage.acceptBid(bidId, bid.taskId);
      
      // Create payment record
      const platformFee = (parseFloat(result.bid.amount) * 0.1).toFixed(2); // 10% platform fee
      await storage.createPayment({
        taskId: bid.taskId,
        customerId: task.customerId,
        workerId: result.bid.workerId,
        amount: result.bid.amount,
        platformFee,
        stripePaymentIntentId: null,
        status: 'pending',
      });
      
      // Broadcast bid acceptance
      const message = JSON.stringify({
        type: 'BID_ACCEPTED',
        data: { taskId: bid.taskId, bidId, workerId: result.bid.workerId }
      });
      
      wsConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, taskId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          taskId: taskId,
          customerId: req.user.claims.sub,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      const message = await storage.createMessage(validatedData);
      
      // Send real-time message
      const wsMessage = JSON.stringify({
        type: 'NEW_MESSAGE',
        data: message
      });
      
      const receiverWs = wsConnections.get(validatedData.receiverId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(wsMessage);
      }
      
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/tasks/:taskId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesForTask(req.params.taskId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // User profile routes
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isWorker, phone, location } = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        isWorker,
        phone,
        location,
        updatedAt: new Date(),
      });
      
      res.json(user);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'AUTHENTICATE') {
          const userId = message.userId;
          if (userId) {
            wsConnections.set(userId, ws);
            ws.send(JSON.stringify({ type: 'AUTHENTICATED', userId }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection from map
      for (const [userId, connection] of wsConnections.entries()) {
        if (connection === ws) {
          wsConnections.delete(userId);
          break;
        }
      }
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
