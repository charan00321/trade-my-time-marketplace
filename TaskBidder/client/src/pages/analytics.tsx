import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award,
  MapPin,
  Calendar
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: !!user,
  });

  // Mock analytics data for demonstration
  const mockAnalytics = {
    overview: {
      totalTasks: 1247,
      activeTasks: 89,
      completedTasks: 1158,
      totalRevenue: 45780,
      averageTaskValue: 38.50,
      customerSatisfaction: 4.8
    },
    growth: {
      taskGrowth: 23.5,
      revenueGrowth: 34.2,
      userGrowth: 18.7,
      workerGrowth: 41.3
    },
    categories: [
      { name: 'Grocery Shopping', tasks: 456, revenue: 17520, growth: 12.3 },
      { name: 'Document Pickup', tasks: 234, revenue: 8190, growth: 8.7 },
      { name: 'Queue Standing', tasks: 178, revenue: 5340, growth: 15.2 },
      { name: 'Delivery', tasks: 201, revenue: 7530, growth: 22.1 },
      { name: 'Cleaning', tasks: 178, revenue: 7200, growth: 6.9 }
    ],
    timeData: [
      { time: '9 AM', tasks: 23 },
      { time: '12 PM', tasks: 67 },
      { time: '3 PM', tasks: 45 },
      { time: '6 PM', tasks: 89 },
      { time: '9 PM', tasks: 34 }
    ],
    locations: [
      { area: 'Downtown', tasks: 234, avgBudget: 45.20 },
      { area: 'Uptown', tasks: 189, avgBudget: 52.80 },
      { area: 'Suburbs', tasks: 156, avgBudget: 38.90 },
      { area: 'Business District', tasks: 201, avgBudget: 65.40 }
    ],
    workers: {
      total: 1456,
      active: 892,
      topRated: 234,
      verified: 678,
      averageRating: 4.6,
      responseTime: '12 minutes'
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="analytics-page">
      <Navigation user={user!} />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your marketplace performance</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" data-testid="button-export-data">
                Export Data
              </Button>
              <Button className="bg-primary hover:bg-blue-700" data-testid="button-generate-report">
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="metric-total-tasks">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalTasks.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{mockAnalytics.growth.taskGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="metric-revenue">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${mockAnalytics.overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{mockAnalytics.growth.revenueGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="metric-active-workers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                  <p className="text-2xl font-bold">{mockAnalytics.workers.active.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{mockAnalytics.growth.workerGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="metric-satisfaction">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Customer Rating</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.customerSatisfaction}/5.0</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Award className="w-3 h-3 mr-1" />
                    Excellent rating
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Category Performance */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="category-performance-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.tasks} tasks • ${category.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                      <Badge 
                        className={`${category.growth > 15 ? 'bg-green-100 text-green-700' : 
                                   category.growth > 10 ? 'bg-yellow-100 text-yellow-700' : 
                                   'bg-gray-100 text-gray-700'}`}
                      >
                        +{category.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours Analysis */}
            <Card data-testid="peak-hours-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Peak Hours Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.timeData.map((time, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-16 text-sm font-medium">{time.time}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(time.tasks / 89) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{time.tasks}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            
            {/* Worker Stats */}
            <Card data-testid="worker-stats-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Worker Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Workers</span>
                  <span className="font-medium">{mockAnalytics.workers.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active This Week</span>
                  <span className="font-medium">{mockAnalytics.workers.active.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Top Rated (5★)</span>
                  <span className="font-medium">{mockAnalytics.workers.topRated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <span className="font-medium">{mockAnalytics.workers.verified.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response</span>
                  <span className="font-medium">{mockAnalytics.workers.responseTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location Performance */}
            <Card data-testid="location-performance-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{location.area}</p>
                        <p className="text-xs text-muted-foreground">{location.tasks} tasks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${location.avgBudget}</p>
                        <p className="text-xs text-muted-foreground">avg budget</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-testid="quick-actions-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-promote-category">
                  <Target className="w-4 h-4 mr-2" />
                  Promote Top Category
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-worker-incentive">
                  <Award className="w-4 h-4 mr-2" />
                  Launch Worker Incentive
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-schedule-report">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}