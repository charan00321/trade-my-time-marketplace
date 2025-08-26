import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin } from "lucide-react";
import type { User } from "@shared/schema";

interface WorkerProfileProps {
  worker: User;
  distance?: number;
  onClick?: () => void;
}

export function WorkerProfile({ worker, distance, onClick }: WorkerProfileProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRating = () => {
    return worker.workerRating ? parseFloat(worker.workerRating) : 4.5;
  };

  const getTaskCount = () => {
    return parseInt(worker.completedTasks || '0');
  };

  const isOnline = true; // In a real app, this would come from worker status

  return (
    <Card 
      className={`hover:shadow-sm transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      data-testid={`worker-profile-${worker.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={worker.profileImageUrl ?? undefined} 
              alt={`${worker.firstName} ${worker.lastName}`} 
            />
            <AvatarFallback>
              {getInitials(worker.firstName, worker.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900" data-testid="worker-name">
                {worker.firstName} {worker.lastName?.charAt(0)}.
              </h4>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-muted-foreground ml-1" data-testid="worker-rating">
                  {getRating().toFixed(1)}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={isOnline ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700"}
                data-testid="worker-status"
              >
                {isOnline && <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>}
                {isOnline ? 'Online' : 'Busy'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground" data-testid="worker-stats">
              {getTaskCount()} tasks • {distance ? `${distance.toFixed(1)} miles away` : 'Location not set'}
            </p>
            <p className="text-xs text-gray-700" data-testid="worker-specialties">
              {worker.location ? `Based in ${worker.location}` : 'Any task, very reliable'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
