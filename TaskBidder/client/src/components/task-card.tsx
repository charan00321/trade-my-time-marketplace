import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, ShoppingCart, FileText, Users, Package, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TaskWithRelations } from "@shared/schema";

const categoryIcons = {
  grocery_shopping: ShoppingCart,
  document_pickup: FileText,
  queue_standing: Users,
  delivery: Package,
  cleaning: Sparkles,
  other: Package,
};

const statusColors = {
  open: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  open: "Open for Bids",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface TaskCardProps {
  task: TaskWithRelations;
  onViewBids: () => void;
}

export function TaskCard({ task, onViewBids }: TaskCardProps) {
  const IconComponent = categoryIcons[task.category] || Package;
  const bidCount = task.bids?.length || 0;
  const hasActiveBids = task.status === 'open' && bidCount > 0;

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(0)}`;
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onViewBids}
      data-testid={`task-card-${task.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900" data-testid="task-title">{task.title}</h3>
              <p className="text-sm text-muted-foreground" data-testid="task-created-at">
                Posted {task.createdAt ? getTimeAgo(task.createdAt) : 'Recently'}
              </p>
            </div>
          </div>
          <Badge 
            className={`${task.status ? statusColors[task.status] : statusColors.open} font-medium`}
            data-testid="task-status-badge"
          >
            {hasActiveBids ? `${bidCount} Bids Received` : (task.status ? statusLabels[task.status] : statusLabels.open)}
          </Badge>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2" data-testid="task-description">
          {task.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate max-w-24" data-testid="task-location">{task.location}</span>
            </span>
            <span className="flex items-center text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span data-testid="task-urgency">
                {task.urgency === 'asap' ? 'ASAP' : 
                 task.urgency === 'today' ? 'Today' :
                 task.urgency === 'tomorrow' ? 'Tomorrow' :
                 task.urgency === '3_days' ? 'Within 3 days' :
                 task.urgency === 'week' ? 'This week' : 'Flexible'}
              </span>
            </span>
            <span className="flex items-center text-green-600">
              <DollarSign className="w-3 h-3 mr-1" />
              <span data-testid="task-budget">
                {formatCurrency(task.budgetMin)}-{formatCurrency(task.budgetMax)}
              </span>
            </span>
          </div>
          
          {task.status === 'open' ? (
            <Button 
              size="sm"
              className="bg-primary hover:bg-blue-700"
              data-testid="button-view-bids"
            >
              {bidCount > 0 ? `View ${bidCount} Bids` : 'View Details'}
            </Button>
          ) : task.status === 'assigned' || task.status === 'in_progress' ? (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                data-testid="button-message-worker"
              >
                Message
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-track-progress"
              >
                Track
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              data-testid="button-view-details"
            >
              View Details
            </Button>
          )}
        </div>

        {task.worker && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium" data-testid="assigned-worker">
                {task.worker.firstName} {task.worker.lastName}
              </span>
              {task.finalPrice && (
                <span className="text-green-600 font-medium" data-testid="final-price">
                  • Final Price: {formatCurrency(task.finalPrice)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
