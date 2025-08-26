import {
  users,
  tasks,
  bids,
  payments,
  messages,
  type User,
  type UpsertUser,
  type Task,
  type TaskWithRelations,
  type InsertTask,
  type Bid,
  type BidWithWorker,
  type InsertBid,
  type Payment,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: string): Promise<TaskWithRelations | undefined>;
  getTasksByCustomer(customerId: string): Promise<TaskWithRelations[]>;
  getTasksByWorker(workerId: string): Promise<TaskWithRelations[]>;
  getOpenTasks(limit?: number): Promise<TaskWithRelations[]>;
  updateTaskStatus(id: string, status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled', workerId?: string): Promise<Task>;
  updateTaskFinalPrice(id: string, finalPrice: string): Promise<Task>;
  addTaskCompletionPhotos(id: string, photos: string[]): Promise<Task>;
  
  // Bid operations
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsForTask(taskId: string): Promise<BidWithWorker[]>;
  getBidsByWorker(workerId: string): Promise<Bid[]>;
  updateBidStatus(id: string, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'): Promise<Bid>;
  acceptBid(bidId: string, taskId: string): Promise<{ bid: Bid; task: Task }>;
  
  // Payment operations
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: 'pending' | 'held' | 'released' | 'refunded'): Promise<Payment>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForTask(taskId: string): Promise<Message[]>;
  
  // Stats operations
  getWorkerStats(): Promise<{ activeWorkers: number; completedTasks: number; averageRating: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: string): Promise<TaskWithRelations | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.customerId, users.id))
      .leftJoin(users, eq(tasks.workerId, users.id))
      .where(eq(tasks.id, id));
    
    if (!task) return undefined;

    const taskBids = await this.getBidsForTask(id);
    
    return {
      ...task.tasks,
      customer: task.users!,
      worker: task.users || undefined,
      bids: taskBids,
    };
  }

  async getTasksByCustomer(customerId: string): Promise<TaskWithRelations[]> {
    const taskData = await db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.customerId, users.id))
      .leftJoin(users, eq(tasks.workerId, users.id))
      .where(eq(tasks.customerId, customerId))
      .orderBy(desc(tasks.createdAt));

    const tasksWithBids = await Promise.all(
      taskData.map(async (row) => {
        const taskBids = await this.getBidsForTask(row.tasks.id);
        return {
          ...row.tasks,
          customer: row.users!,
          worker: row.users || undefined,
          bids: taskBids,
        };
      })
    );

    return tasksWithBids;
  }

  async getTasksByWorker(workerId: string): Promise<TaskWithRelations[]> {
    const taskData = await db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.customerId, users.id))
      .leftJoin(users, eq(tasks.workerId, users.id))
      .where(eq(tasks.workerId, workerId))
      .orderBy(desc(tasks.createdAt));

    const tasksWithBids = await Promise.all(
      taskData.map(async (row) => {
        const taskBids = await this.getBidsForTask(row.tasks.id);
        return {
          ...row.tasks,
          customer: row.users!,
          worker: row.users || undefined,
          bids: taskBids,
        };
      })
    );

    return tasksWithBids;
  }

  async getOpenTasks(limit = 50): Promise<TaskWithRelations[]> {
    const taskData = await db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.customerId, users.id))
      .where(eq(tasks.status, 'open'))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);

    const tasksWithBids = await Promise.all(
      taskData.map(async (row) => {
        const taskBids = await this.getBidsForTask(row.tasks.id);
        return {
          ...row.tasks,
          customer: row.users!,
          worker: undefined,
          bids: taskBids,
        };
      })
    );

    return tasksWithBids;
  }

  async updateTaskStatus(id: string, status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled', workerId?: string): Promise<Task> {
    const updateData: any = { status, updatedAt: new Date() };
    if (workerId) updateData.workerId = workerId;
    if (status === 'completed') updateData.completedAt = new Date();

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async updateTaskFinalPrice(id: string, finalPrice: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ finalPrice, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async addTaskCompletionPhotos(id: string, photos: string[]): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ completionPhotos: photos, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  // Bid operations
  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async getBidsForTask(taskId: string): Promise<BidWithWorker[]> {
    const bidData = await db
      .select()
      .from(bids)
      .leftJoin(users, eq(bids.workerId, users.id))
      .where(eq(bids.taskId, taskId))
      .orderBy(asc(bids.amount));

    return bidData.map(row => ({
      ...row.bids,
      worker: row.users!,
    }));
  }

  async getBidsByWorker(workerId: string): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.workerId, workerId))
      .orderBy(desc(bids.createdAt));
  }

  async updateBidStatus(id: string, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'): Promise<Bid> {
    const [bid] = await db
      .update(bids)
      .set({ status, updatedAt: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return bid;
  }

  async acceptBid(bidId: string, taskId: string): Promise<{ bid: Bid; task: Task }> {
    // Accept the selected bid
    const [acceptedBid] = await db
      .update(bids)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(bids.id, bidId))
      .returning();

    // Reject all other bids for this task
    await db
      .update(bids)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(eq(bids.taskId, taskId), sql`${bids.id} != ${bidId}`));

    // Update task status and assign worker
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        status: 'assigned', 
        workerId: acceptedBid.workerId,
        finalPrice: acceptedBid.amount,
        updatedAt: new Date() 
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return { bid: acceptedBid, task: updatedTask };
  }

  // Payment operations
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async updatePaymentStatus(id: string, status: 'pending' | 'held' | 'released' | 'refunded'): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesForTask(taskId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.taskId, taskId))
      .orderBy(asc(messages.createdAt));
  }

  // Stats operations
  async getWorkerStats(): Promise<{ activeWorkers: number; completedTasks: number; averageRating: number }> {
    const activeWorkers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isWorker, true));

    const completedTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, 'completed'));

    const averageRating = await db
      .select({ avg: sql<number>`avg(${users.workerRating})` })
      .from(users)
      .where(and(eq(users.isWorker, true), sql`${users.workerRating} IS NOT NULL`));

    return {
      activeWorkers: activeWorkers[0]?.count || 0,
      completedTasks: completedTasks[0]?.count || 0,
      averageRating: Number(averageRating[0]?.avg || 4.9),
    };
  }
}

export const storage = new DatabaseStorage();
