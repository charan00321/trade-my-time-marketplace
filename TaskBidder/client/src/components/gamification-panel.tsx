import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Crown,
  Zap,
  Target,
  Gift,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Flame
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  reward: string;
  unlocked: boolean;
}

interface GamificationPanelProps {
  userId: string;
}

export function GamificationPanel({ userId }: GamificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'rewards'>('achievements');

  // Fetch user stats and achievements
  const { data: userStats } = useQuery({
    queryKey: ['/api/users/stats', userId],
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements', userId],
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  // Mock data for comprehensive gamification
  const mockUserStats = {
    level: userStats?.level || 3,
    totalPoints: userStats?.totalPoints || 2450,
    currentStreak: userStats?.currentStreak || 7,
    longestStreak: userStats?.longestStreak || 14,
    tasksCompleted: userStats?.tasksCompleted || 47,
    avgRating: userStats?.avgRating || 4.8,
    nextLevelPoints: 3000,
    badges: ['Early Bird', 'Customer Favorite', 'Speed Demon']
  };

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first task',
      icon: '🎯',
      progress: 1,
      target: 1,
      reward: '50 points + Welcome Badge',
      unlocked: true
    },
    {
      id: '2',
      name: 'Getting Started',
      description: 'Complete 10 tasks',
      icon: '⭐',
      progress: 10,
      target: 10,
      reward: '200 points + Rising Star Badge',
      unlocked: true
    },
    {
      id: '3',
      name: 'Dedicated Worker',
      description: 'Complete 50 tasks',
      icon: '💪',
      progress: 47,
      target: 50,
      reward: '500 points + Dedicated Badge',
      unlocked: false
    },
    {
      id: '4',
      name: 'Speed Demon',
      description: 'Complete 5 tasks in one day',
      icon: '⚡',
      progress: 3,
      target: 5,
      reward: '300 points + Speed Badge',
      unlocked: false
    },
    {
      id: '5',
      name: 'Customer Favorite',
      description: 'Maintain 4.8+ rating for 20 tasks',
      icon: '❤️',
      progress: 20,
      target: 20,
      reward: '400 points + Favorite Badge',
      unlocked: true
    },
    {
      id: '6',
      name: 'Streak Master',
      description: 'Complete tasks for 7 days straight',
      icon: '🔥',
      progress: 7,
      target: 7,
      reward: '350 points + Streak Badge',
      unlocked: true
    }
  ];

  const mockLeaderboard = [
    { rank: 1, name: 'Alex Smith', points: 4850, level: 5, avatar: '👨‍💼' },
    { rank: 2, name: 'Sarah Johnson', points: 4320, level: 4, avatar: '👩‍💼' },
    { rank: 3, name: 'Mike Chen', points: 3890, level: 4, avatar: '👨' },
    { rank: 4, name: 'Emma Davis', points: 3240, level: 3, avatar: '👩' },
    { rank: 5, name: 'You', points: mockUserStats.totalPoints, level: mockUserStats.level, avatar: '🎯' },
    { rank: 6, name: 'John Wilson', points: 2180, level: 3, avatar: '👨‍🔧' },
    { rank: 7, name: 'Lisa Brown', points: 1950, level: 2, avatar: '👩‍🎓' }
  ];

  const getLevelProgress = () => {
    const currentLevelBase = (mockUserStats.level - 1) * 1000;
    const nextLevelBase = mockUserStats.level * 1000;
    const progress = ((mockUserStats.totalPoints - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="space-y-6" data-testid="gamification-panel">
      
      {/* Player Stats Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white" data-testid="player-stats-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {mockUserStats.level} Worker</h3>
                <p className="text-blue-200">Total Points: {mockUserStats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-300">{mockUserStats.currentStreak}</div>
              <div className="text-sm text-blue-200 flex items-center">
                <Flame className="w-4 h-4 mr-1" />
                Day Streak
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {mockUserStats.level + 1}</span>
              <span>{mockUserStats.nextLevelPoints - mockUserStats.totalPoints} points to go</span>
            </div>
            <Progress value={getLevelProgress()} className="h-3 bg-blue-800" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold">{mockUserStats.tasksCompleted}</div>
              <div className="text-xs text-blue-200">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{mockUserStats.avgRating}⭐</div>
              <div className="text-xs text-blue-200">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{mockUserStats.longestStreak}</div>
              <div className="text-xs text-blue-200">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'achievements', label: 'Achievements', icon: Trophy },
          { key: 'leaderboard', label: 'Leaderboard', icon: Crown },
          { key: 'rewards', label: 'Rewards', icon: Gift }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === key 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            data-testid={`tab-${key}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'achievements' && (
        <div className="grid md:grid-cols-2 gap-4" data-testid="achievements-tab">
          {mockAchievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`${achievement.unlocked ? 'bg-green-50 border-green-200' : ''}`}
              data-testid={`achievement-${achievement.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      {achievement.unlocked && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress: {achievement.progress}/{achievement.target}</span>
                          <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <Badge className={achievement.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                        {achievement.reward}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card data-testid="leaderboard-tab">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-500" />
              Top Workers This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaderboard.map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  }`}
                  data-testid={`leaderboard-${player.rank}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      player.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      player.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      player.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {player.rank <= 3 ? (
                        player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        player.rank
                      )}
                    </div>
                    <div className="text-lg">{player.avatar}</div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-xs text-muted-foreground">Level {player.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{player.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-4" data-testid="rewards-tab">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Points Store</h3>
              <p className="mb-4">Exchange your points for amazing rewards!</p>
              <Button className="bg-white text-orange-600 hover:bg-gray-100" data-testid="button-visit-store">
                Visit Points Store
              </Button>
            </CardContent>
          </Card>

          {/* Available Rewards */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: '$5 Cash Bonus', cost: 1000, icon: '💵', available: true },
              { name: 'Premium Badge', cost: 1500, icon: '🏆', available: true },
              { name: '$10 Cash Bonus', cost: 2000, icon: '💰', available: true },
              { name: 'VIP Status (1 month)', cost: 2500, icon: '👑', available: false },
              { name: '$25 Cash Bonus', cost: 5000, icon: '💎', available: false },
              { name: 'Exclusive Swag Box', cost: 3000, icon: '📦', available: false }
            ].map((reward, index) => (
              <Card key={index} className={!reward.available ? 'opacity-60' : ''} data-testid={`reward-${index}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-3">{reward.icon}</div>
                  <h4 className="font-semibold mb-2">{reward.name}</h4>
                  <Badge className="mb-3">{reward.cost.toLocaleString()} points</Badge>
                  <Button 
                    className="w-full" 
                    disabled={!reward.available || mockUserStats.totalPoints < reward.cost}
                    data-testid={`button-redeem-${index}`}
                  >
                    {reward.available ? 'Redeem' : 'Locked'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Daily Challenges */}
      <Card data-testid="daily-challenges-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: 'Complete 2 tasks today', progress: 1, target: 2, reward: '100 points' },
              { task: 'Maintain 5⭐ rating', progress: 1, target: 1, reward: '50 points' },
              { task: 'Respond within 5 minutes', progress: 3, target: 5, reward: '75 points' }
            ].map((challenge, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{challenge.task}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress 
                      value={(challenge.progress / challenge.target) * 100} 
                      className="flex-1 h-2" 
                    />
                    <span className="text-xs text-muted-foreground">
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-3">{challenge.reward}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}