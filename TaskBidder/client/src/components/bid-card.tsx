import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, Tag, Car, Clock, Snowflake, User, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { BidWithWorker } from "@shared/schema";

interface BidCardProps {
  bid: BidWithWorker;
  isRecommended?: boolean;
  onAccept: () => void;
  onMessage: () => void;
  onViewProfile: () => void;
  taskBudgetMin: string;
  taskBudgetMax: string;
}

export function BidCard({ 
  bid, 
  isRecommended = false, 
  onAccept, 
  onMessage, 
  onViewProfile,
  taskBudgetMin,
  taskBudgetMax 
}: BidCardProps) {
  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(0)}`;
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRating = () => {
    return bid.worker.workerRating ? parseFloat(bid.worker.workerRating) : 4.5;
  };

  const getTaskCount = () => {
    return parseInt(bid.worker.completedTasks || '0');
  };

  return (
    <Card 
      className={`p-6 ${isRecommended ? 'border-2 border-primary bg-blue-50' : 'border border-gray-200'}`}
      data-testid={`bid-card-${bid.id}`}
    >
      <CardContent className="p-0">
        {/* Badges */}
        <div className="flex items-center space-x-2 mb-3">
          {isRecommended && (
            <Badge className="bg-primary text-white">
              <Star className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
          )}
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Fast Response
          </Badge>
        </div>

        {/* Worker Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={bid.worker.profileImageUrl ?? undefined} 
                alt={`${bid.worker.firstName} ${bid.worker.lastName}`} 
              />
              <AvatarFallback>
                {getInitials(bid.worker.firstName, bid.worker.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900" data-testid="worker-name">
                  {bid.worker.firstName} {bid.worker.lastName}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(getRating()) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground" data-testid="worker-rating">
                    ({getRating().toFixed(1)})
                  </span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online Now
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground" data-testid="worker-stats">
                {getTaskCount()} completed tasks • 0.8 miles away
              </p>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  ID Verified
                </span>
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  Background Checked
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 mb-1" data-testid="bid-amount">
              {formatCurrency(bid.amount)}
            </div>
            <div className="text-sm text-muted-foreground">
              Your budget: {formatCurrency(taskBudgetMin)}-{formatCurrency(taskBudgetMax)}
            </div>
          </div>
        </div>

        {/* Bid Message */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <p className="text-gray-700 mb-3" data-testid="bid-message">
            {bid.message || "I'm ready to complete this task for you. I have all the necessary equipment and experience to get it done quickly and professionally."}
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Can start in {bid.estimatedDuration || '30'} minutes
            </span>
            <span className="flex items-center">
              <Car className="w-3 h-3 mr-1" />
              Has vehicle
            </span>
            <span className="flex items-center">
              <Snowflake className="w-3 h-3 mr-1" />
              Insulated bags
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onViewProfile}
              data-testid="button-view-profile"
            >
              <User className="w-3 h-3 mr-1" />
              View Profile
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMessage}
              data-testid="button-message"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Message
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              data-testid="button-counter-offer"
            >
              Counter Offer
            </Button>
            <Button 
              onClick={onAccept}
              className={isRecommended ? "bg-primary hover:bg-blue-700" : "border-primary text-primary hover:bg-blue-50"}
              variant={isRecommended ? "default" : "outline"}
              data-testid="button-accept-bid"
            >
              Accept Bid
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
