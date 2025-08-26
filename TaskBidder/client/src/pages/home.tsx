import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { TaskForm } from "@/components/task-form";
import { TaskCard } from "@/components/task-card";
import { WorkerProfile } from "@/components/worker-profile";
import { BiddingModal } from "@/components/bidding-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  History, 
  Gift,
  Bell,
  MapPin,
  Clock,
  DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TaskWithRelations } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch user's tasks
  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/my'],
    enabled: !!user,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({
        type: 'AUTHENTICATE',
        userId: user?.id
      }));
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        switch (message.type) {
          case 'NEW_BID':
            toast({
              title: "New Bid Received!",
              description: `Someone placed a bid on your task`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/my'] });
            break;
          case 'BID_ACCEPTED':
            toast({
              title: "Bid Accepted!",
              description: "Your bid was accepted",
            });
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/my'] });
            break;
          case 'TASK_STATUS_UPDATE':
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/my'] });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [user, toast, queryClient]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const handleViewBids = (task: TaskWithRelations) => {
    setSelectedTask(task);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      <Navigation user={user!} onPostTask={() => setShowTaskForm(true)} />
      
      {/* Stats Section */}
      <div className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-total-tasks">
                {(stats as any)?.completedTasks?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1" data-testid="stat-active-workers">
                {(stats as any)?.activeWorkers?.toLocaleString() || "0"}+
              </div>
              <div className="text-sm text-muted-foreground">Active Workers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500 mb-1" data-testid="stat-average-rating">
                {(stats as any)?.averageRating || "4.9"}★
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-average-time">
                &lt; 2hrs
              </div>
              <div className="text-sm text-muted-foreground">Avg Completion</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Task Posting Card */}
        <Card className="mb-8 border-l-4 border-l-primary shadow-lg" data-testid="task-posting-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Post Your Task</CardTitle>
                <p className="text-muted-foreground">Tell us what you need done and get competitive bids from local helpers</p>
              </div>
              <div className="text-green-600 text-xl">
                <Gift className="w-6 h-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Your payment is protected until task completion</span>
              </div>
              <Button 
                onClick={() => setShowTaskForm(true)}
                className="bg-primary hover:bg-blue-700 shadow-lg"
                data-testid="button-post-task"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Task & Get Bids
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* My Active Tasks */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg" data-testid="active-tasks-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">My Active Tasks</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-primary border-primary">
                      {(myTasks as any)?.filter((task: TaskWithRelations) => task.status !== 'completed').length || 0} Active
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-600">
                      {(myTasks as any)?.filter((task: TaskWithRelations) => task.status === 'completed').length || 0} Completed
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : myTasks && (myTasks as any).length > 0 ? (
                  <div className="space-y-4">
                    {(myTasks as any).map((task: TaskWithRelations) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onViewBids={() => handleViewBids(task)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">You haven't posted any tasks yet</div>
                    <Button 
                      onClick={() => setShowTaskForm(true)}
                      variant="outline"
                      data-testid="button-post-first-task"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-lg" data-testid="quick-actions-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
                    onClick={() => setShowTaskForm(true)}
                    data-testid="button-post-new-task"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Task
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-browse-workers"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Workers
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-view-history"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Task History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Promotional Offer */}
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg" data-testid="promotional-offer-card">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <Gift className="w-6 h-6 mr-3" />
                  <h3 className="font-bold">Special Offer!</h3>
                </div>
                <p className="text-sm mb-4">Get your first 3 tasks completed with a 100% money-back guarantee. Risk-free trial!</p>
                <Button 
                  className="bg-white text-yellow-600 hover:bg-gray-100 font-semibold"
                  data-testid="button-claim-offer"
                >
                  Claim Offer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm 
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/my'] });
            toast({
              title: "Task Posted!",
              description: "Your task has been posted. You'll start receiving bids soon.",
            });
          }}
        />
      )}

      {/* Bidding Modal */}
      {selectedTask && (
        <BiddingModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onBidAccepted={() => {
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/my'] });
            toast({
              title: "Bid Accepted!",
              description: "The worker has been notified and will start your task.",
            });
          }}
        />
      )}
    </div>
  );
}
