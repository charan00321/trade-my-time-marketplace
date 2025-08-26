import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { TaskCard } from "@/components/task-card";
import { BiddingModal } from "@/components/bidding-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  Filter,
  Zap,
  Target,
  TrendingUp,
  Gift,
  Trophy,
  Crown
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TaskWithRelations } from "@shared/schema";

export default function WorkerDiscovery() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [filters, setFilters] = useState({
    category: "all",
    minBudget: 0,
    maxBudget: 100,
    distance: 25,
    urgency: "all",
    sortBy: "recommended"
  });

  // Fetch available tasks with smart matching
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/open', filters],
    enabled: !!user,
  });

  // Fetch user stats for worker dashboard
  const { data: userStats } = useQuery({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  // Smart matching algorithm - shows best tasks first
  const getSmartRecommendations = (tasks: TaskWithRelations[]) => {
    if (!tasks) return [];
    
    return tasks.map(task => ({
      ...task,
      score: calculateMatchScore(task)
    })).sort((a, b) => b.score - a.score);
  };

  const calculateMatchScore = (task: TaskWithRelations) => {
    let score = 0;
    
    // Base score from budget (higher budget = higher score)
    score += parseFloat(task.budgetMax) * 2;
    
    // Urgency bonus
    if (task.urgency === 'asap') score += 50;
    else if (task.urgency === 'today') score += 30;
    else if (task.urgency === 'tomorrow') score += 20;
    
    // Distance penalty (closer = higher score)
    score += (25 - 5) * 2; // Mock distance calculation
    
    // Category preference bonus
    if (userStats?.preferredCategories?.includes(task.category)) {
      score += 25;
    }
    
    // Customer rating bonus
    if (task.customer.workerRating) {
      score += parseFloat(task.customer.workerRating) * 5;
    }
    
    return score;
  };

  const placeBidMutation = useMutation({
    mutationFn: async (data: { taskId: string; amount: number; message: string; estimatedDuration: string }) => {
      const response = await apiRequest("POST", "/api/bids", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid Placed!",
        description: "Your bid has been submitted. The customer will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/open'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to place bid. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const smartTasks = getSmartRecommendations(tasks || []);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="worker-discovery-page">
      <Navigation user={user} />
      
      {/* Worker Dashboard Header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Worker Dashboard</h1>
              <p className="text-blue-100">Find tasks that match your skills and location</p>
            </div>
            <div className="flex items-center space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold" data-testid="worker-level">
                  Level {userStats?.level || "1"}
                </div>
                <div className="text-sm text-blue-200">Current Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300" data-testid="worker-points">
                  {userStats?.totalPoints || "0"} pts
                </div>
                <div className="text-sm text-blue-200">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300" data-testid="worker-earnings">
                  ${userStats?.totalEarnings || "0"}
                </div>
                <div className="text-sm text-blue-200">Total Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Notifications */}
      <div className="bg-yellow-50 border-l-4 border-l-yellow-400 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              You're only 2 tasks away from reaching Level 3 and unlocking Premium Task access!
            </span>
            <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
              View Progress
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <Card data-testid="filters-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Smart Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters({...filters, category: value})}
                  >
                    <SelectTrigger data-testid="select-category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="grocery_shopping">Grocery Shopping</SelectItem>
                      <SelectItem value="document_pickup">Document Pickup</SelectItem>
                      <SelectItem value="queue_standing">Queue Standing</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Budget Range</label>
                  <div className="mt-2">
                    <Slider
                      value={[filters.minBudget, filters.maxBudget]}
                      onValueChange={([min, max]) => setFilters({...filters, minBudget: min, maxBudget: max})}
                      max={200}
                      step={5}
                      className="w-full"
                      data-testid="budget-range-slider"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>${filters.minBudget}</span>
                      <span>${filters.maxBudget}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Distance</label>
                  <div className="mt-2">
                    <Slider
                      value={[filters.distance]}
                      onValueChange={([distance]) => setFilters({...filters, distance})}
                      max={50}
                      step={1}
                      className="w-full"
                      data-testid="distance-slider"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {filters.distance} miles
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Sort By</label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters({...filters, sortBy: value})}
                  >
                    <SelectTrigger data-testid="select-sort-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-2" />
                          Smart Match
                        </div>
                      </SelectItem>
                      <SelectItem value="budget_high">Highest Budget</SelectItem>
                      <SelectItem value="budget_low">Lowest Budget</SelectItem>
                      <SelectItem value="distance">Closest</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card data-testid="quick-stats-card">
              <CardHeader>
                <CardTitle>Today's Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High Paying Tasks</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      8 available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Near You (&lt; 5mi)</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      12 tasks
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your Expertise</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      5 matches
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white" data-testid="special-offers-card">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <Gift className="w-5 h-5 mr-2" />
                  <h3 className="font-bold">Weekend Bonus!</h3>
                </div>
                <p className="text-sm mb-4">Complete 3 tasks this weekend and earn 50% bonus points plus a $10 completion bonus!</p>
                <Button 
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                  data-testid="button-claim-weekend-bonus"
                >
                  Claim Bonus
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Bar */}
            <Card data-testid="search-card">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search tasks by location, description, or keywords..."
                      className="pl-10"
                      data-testid="search-tasks-input"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-blue-700" data-testid="button-search-tasks">
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Recommended Tasks ({smartTasks.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Smart matched for you</span>
                </div>
              </div>

              {tasksLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : smartTasks.length > 0 ? (
                <div className="space-y-4">
                  {smartTasks.slice(0, 3).map((task, index) => (
                    <Card 
                      key={task.id}
                      className={`${index === 0 ? 'border-2 border-primary bg-blue-50' : ''} hover:shadow-lg transition-all cursor-pointer`}
                      onClick={() => setSelectedTask(task)}
                      data-testid={`recommended-task-${index}`}
                    >
                      <CardContent className="p-6">
                        {index === 0 && (
                          <div className="flex items-center space-x-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <Badge className="bg-primary text-white">Best Match</Badge>
                            <Badge variant="outline" className="border-green-500 text-green-700">
                              Score: {Math.round(task.score)}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2" data-testid="task-title">
                              {task.title}
                            </h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2" data-testid="task-description">
                              {task.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600" data-testid="task-budget">
                              ${parseFloat(task.budgetMin).toFixed(0)}-${parseFloat(task.budgetMax).toFixed(0)}
                            </div>
                            <div className="text-sm text-muted-foreground">Budget</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              0.8 mi away
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.urgency === 'asap' ? 'ASAP' : 
                               task.urgency === 'today' ? 'Today' :
                               task.urgency === 'tomorrow' ? 'Tomorrow' : 'Flexible'}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-400" />
                              Customer: 4.8
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Quick bid functionality
                                toast({
                                  title: "Quick Bid",
                                  description: "Quick bid feature would open here",
                                });
                              }}
                              data-testid="button-quick-bid"
                            >
                              Quick Bid
                            </Button>
                            <Button 
                              className="bg-primary hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              data-testid="button-view-details"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* More Tasks */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {smartTasks.slice(3).map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onViewBids={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="text-center py-12" data-testid="no-tasks-message">
                  <CardContent>
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tasks match your filters</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later for new opportunities</p>
                    <Button 
                      variant="outline"
                      onClick={() => setFilters({
                        category: "all",
                        minBudget: 0,
                        maxBudget: 100,
                        distance: 25,
                        urgency: "all",
                        sortBy: "recommended"
                      })}
                      data-testid="button-reset-filters"
                    >
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <BiddingModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onBidAccepted={() => {
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['/api/tasks/open'] });
          }}
        />
      )}
    </div>
  );
}