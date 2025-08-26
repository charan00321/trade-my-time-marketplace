import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BidCard } from "./bid-card";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskWithRelations, BidWithWorker } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface BiddingModalProps {
  task: TaskWithRelations;
  onClose: () => void;
  onBidAccepted: () => void;
}

export function BiddingModal({ task, onClose, onBidAccepted }: BiddingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery<BidWithWorker[]>({
    queryKey: ['/api/tasks', task.id, 'bids'],
  });

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const response = await apiRequest("POST", `/api/bids/${bidId}/accept`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid Accepted!",
        description: "The worker has been notified and will start your task.",
      });
      onBidAccepted();
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
        description: error.message || "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptBid = (bidId: string) => {
    acceptBidMutation.mutate(bidId);
  };

  const handleMessage = (workerId: string) => {
    toast({
      title: "Message Feature",
      description: "Direct messaging functionality would be implemented here.",
    });
  };

  const handleViewProfile = (workerId: string) => {
    toast({
      title: "Worker Profile",
      description: "Worker profile modal would open here with detailed information.",
    });
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Find recommended bid (highest rated worker with reasonable price)
  const getRecommendedBidId = () => {
    if (!bids || bids.length === 0) return null;
    
    // Sort by rating and price to find best value
    const sortedBids = [...bids].sort((a, b) => {
      const ratingA = parseFloat(a.worker.workerRating || '0');
      const ratingB = parseFloat(b.worker.workerRating || '0');
      const priceA = parseFloat(a.amount);
      const priceB = parseFloat(b.amount);
      
      // Prioritize higher rating, then lower price
      if (ratingA !== ratingB) return ratingB - ratingA;
      return priceA - priceB;
    });
    
    return sortedBids[0]?.id || null;
  };

  const recommendedBidId = getRecommendedBidId();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="bidding-modal"
    >
      <Card 
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-2xl" data-testid="modal-title">
              Bids for "{task.title}"
            </CardTitle>
            <p className="text-muted-foreground" data-testid="modal-subtitle">
              {bids?.length || 0} bids received • Posted {task.createdAt ? getTimeAgo(task.createdAt) : 'Recently'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: "calc(90vh - 120px)" }}>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : bids && bids.length > 0 ? (
            bids.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isRecommended={bid.id === recommendedBidId}
                onAccept={() => handleAcceptBid(bid.id)}
                onMessage={() => handleMessage(bid.workerId)}
                onViewProfile={() => handleViewProfile(bid.workerId)}
                taskBudgetMin={task.budgetMin}
                taskBudgetMax={task.budgetMax}
              />
            ))
          ) : (
            <div className="text-center py-12" data-testid="no-bids-message">
              <div className="text-muted-foreground text-lg mb-2">No bids received yet</div>
              <p className="text-sm text-muted-foreground">
                Your task was just posted. Bids typically start coming in within 15-30 minutes.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
