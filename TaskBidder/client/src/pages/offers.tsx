import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Zap, 
  TrendingUp, 
  Users, 
  Crown,
  Target,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Shield
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OffersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active offers and user stats
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/offers'],
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const { data: userOffers } = useQuery({
    queryKey: ['/api/user-offers'],
    enabled: !!user,
  });

  const claimOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest("POST", `/api/offers/${offerId}/claim`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Offer Claimed!",
        description: "You've successfully claimed this offer. Start completing tasks to earn rewards!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-offers'] });
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
        description: error.message || "Failed to claim offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock data for demonstration
  const specialOffers = [
    {
      id: '1',
      type: 'attraction',
      name: 'New User Welcome',
      description: 'Get your first task completed with a money-back guarantee!',
      icon: <Shield className="w-6 h-6" />,
      benefit: '100% Money-Back Guarantee',
      action: 'Post Your First Task',
      color: 'from-green-500 to-emerald-600',
      isEligible: (userStats?.tasksPosted || 0) === 0
    },
    {
      id: '2',
      type: 'upsell',
      name: 'Premium Task Package',
      description: 'Upgrade to premium tasks and get priority matching with top-rated workers',
      icon: <Crown className="w-6 h-6" />,
      benefit: 'Priority Matching + Premium Support',
      action: 'Upgrade Now - $9.99/month',
      color: 'from-purple-500 to-indigo-600',
      isEligible: true
    },
    {
      id: '3',
      type: 'continuity',
      name: 'Task Subscription',
      description: 'Subscribe to weekly recurring tasks and save 25% on all task fees',
      icon: <Target className="w-6 h-6" />,
      benefit: '25% Off + Automatic Scheduling',
      action: 'Start Subscription',
      color: 'from-blue-500 to-cyan-600',
      isEligible: (userStats?.tasksCompleted || 0) >= 3
    },
    {
      id: '4',
      type: 'downsell',
      name: 'Budget-Friendly Tasks',
      description: 'Try our basic task posting for just $2.99 - perfect for simple jobs',
      icon: <DollarSign className="w-6 h-6" />,
      benefit: 'Only $2.99 Per Task',
      action: 'Try Basic Plan',
      color: 'from-orange-500 to-red-600',
      isEligible: true
    }
  ];

  const limitedTimeOffers = [
    {
      id: 'weekend-1',
      name: 'Weekend Warrior',
      description: 'Complete any 3 tasks this weekend and get 50% bonus points plus $10 cash back!',
      timeLeft: '2 days 14 hours',
      progress: 1,
      target: 3,
      reward: '50% Bonus + $10 Cash',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    },
    {
      id: 'refer-friends',
      name: 'Refer & Earn',
      description: 'Invite friends and earn $25 for each friend who completes their first task',
      progress: 2,
      target: 5,
      reward: '$25 per friend',
      color: 'bg-gradient-to-r from-pink-500 to-rose-600'
    }
  ];

  const loyaltyProgram = {
    currentLevel: userStats?.level || 1,
    nextLevel: (userStats?.level || 1) + 1,
    pointsToNext: Math.max(0, ((userStats?.level || 1) + 1) * 1000 - (userStats?.totalPoints || 0)),
    progressPercent: Math.min(100, ((userStats?.totalPoints || 0) % 1000) / 10),
    benefits: [
      { level: 2, benefit: 'Priority Customer Support', unlocked: (userStats?.level || 1) >= 2 },
      { level: 3, benefit: 'Premium Task Access', unlocked: (userStats?.level || 1) >= 3 },
      { level: 4, benefit: 'VIP Worker Matching', unlocked: (userStats?.level || 1) >= 4 },
      { level: 5, benefit: 'Concierge Service', unlocked: (userStats?.level || 1) >= 5 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="offers-page">
      <Navigation user={user!} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Exclusive Offers & Rewards</h1>
            <p className="text-xl text-blue-100 mb-8">Unlock amazing deals and grow your business with our special promotions</p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">{userStats?.level || "1"}</div>
                <div className="text-sm text-blue-200">Your Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">{userStats?.totalPoints || "0"}</div>
                <div className="text-sm text-blue-200">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300">4</div>
                <div className="text-sm text-blue-200">Active Offers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Special Offers Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Business Growth Offers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialOffers.map((offer) => (
              <Card 
                key={offer.id}
                className={`relative overflow-hidden ${offer.isEligible ? '' : 'opacity-60'}`}
                data-testid={`offer-card-${offer.id}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${offer.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${offer.color} text-white`}>
                      {offer.icon}
                    </div>
                    {offer.isEligible && (
                      <Badge className="bg-green-100 text-green-700">Eligible</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {offer.benefit}
                    </div>
                    <Button 
                      className={`w-full bg-gradient-to-r ${offer.color} text-white border-0 hover:opacity-90`}
                      disabled={!offer.isEligible || claimOfferMutation.isPending}
                      onClick={() => claimOfferMutation.mutate(offer.id)}
                      data-testid={`button-claim-${offer.id}`}
                    >
                      {offer.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Limited Time Offers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Limited Time Offers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {limitedTimeOffers.map((offer) => (
              <Card key={offer.id} className="relative overflow-hidden" data-testid={`limited-offer-${offer.id}`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${offer.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                      {offer.name}
                    </CardTitle>
                    {offer.timeLeft && (
                      <Badge variant="destructive" className="animate-pulse">
                        {offer.timeLeft} left
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{offer.description}</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress: {offer.progress}/{offer.target}</span>
                        <span className="font-medium text-green-600">{offer.reward}</span>
                      </div>
                      <Progress value={(offer.progress / offer.target) * 100} className="h-2" />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                      data-testid={`button-join-${offer.id}`}
                    >
                      {offer.progress > 0 ? 'Continue Progress' : 'Join Challenge'}
                      <Target className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">VIP Loyalty Program</h2>
          <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white" data-testid="loyalty-program-card">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-2xl font-bold">Level {loyaltyProgram.currentLevel} Member</h3>
                      <p className="text-purple-200">Premium marketplace access</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to Level {loyaltyProgram.nextLevel}</span>
                      <span>{loyaltyProgram.pointsToNext} points to go</span>
                    </div>
                    <Progress 
                      value={loyaltyProgram.progressPercent} 
                      className="h-3 bg-purple-800" 
                    />
                  </div>

                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    data-testid="button-view-loyalty-benefits"
                  >
                    View All Benefits
                    <Star className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Unlock Premium Benefits</h4>
                  <div className="space-y-3">
                    {loyaltyProgram.benefits.map((benefit) => (
                      <div 
                        key={benefit.level}
                        className={`flex items-center p-3 rounded-lg ${
                          benefit.unlocked 
                            ? 'bg-green-800 bg-opacity-50' 
                            : 'bg-purple-800 bg-opacity-50'
                        }`}
                      >
                        {benefit.unlocked ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        ) : (
                          <Clock className="w-5 h-5 text-purple-300 mr-3" />
                        )}
                        <div className="flex-1">
                          <span className="text-sm font-medium">Level {benefit.level}</span>
                          <p className="text-sm text-purple-200">{benefit.benefit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories / Social Proof */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah K.",
                story: "Used the Premium Package offer and got my grocery shopping done in 30 minutes!",
                savings: "$45 saved",
                avatar: "👩"
              },
              {
                name: "Mike R.",
                story: "Weekend Warrior challenge helped me complete 5 tasks and earned extra $50!",
                savings: "$50 earned",
                avatar: "👨"
              },
              {
                name: "Lisa M.",
                story: "Referral program is amazing! Invited 3 friends and made $75 in bonuses.",
                savings: "$75 earned",
                avatar: "👩‍💼"
              }
            ].map((story, index) => (
              <Card key={index} className="text-center" data-testid={`success-story-${index}`}>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{story.avatar}</div>
                  <h4 className="font-semibold mb-2">{story.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">"{story.story}"</p>
                  <Badge className="bg-green-100 text-green-700">{story.savings}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center" data-testid="cta-section">
          <CardContent className="py-12">
            <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Save More?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of smart customers who are already saving time and money
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                data-testid="button-post-first-task"
              >
                Post Your First Task
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8"
                data-testid="button-explore-offers"
              >
                Explore All Offers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}