"use client";

import { useState, useEffect } from "react";
import { Activity, Trophy, Skull, Zap, Crown, Target, TrendingUp, Users } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'death_pool_win' | 'death_pool_loss' | 'quick_roulette_win' | 'quick_roulette_loss' | 'tournament_win' | 'achievement' | 'big_win';
  user: {
    address: string;
    avatar: string;
  };
  amount?: number;
  multiplier?: number;
  poolSize?: number;
  achievement?: string;
  timestamp: Date;
}

const generateMockActivity = (): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const users = [
    { address: 'Rug...Lord', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=1' },
    { address: 'Diamond...Hand', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=2' },
    { address: 'Whale...Hunter', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=3' },
    { address: 'Moon...Boy', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=4' },
    { address: 'Degen...Ace', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=5' },
    { address: 'You', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user' },
  ];

  const activityTypes = [
    { type: 'death_pool_win', weight: 15 },
    { type: 'death_pool_loss', weight: 30 },
    { type: 'quick_roulette_win', weight: 20 },
    { type: 'quick_roulette_loss', weight: 25 },
    { type: 'tournament_win', weight: 5 },
    { type: 'achievement', weight: 3 },
    { type: 'big_win', weight: 2 }
  ];

  // Generate 20 activities
  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)].type as ActivityItem['type'];
    const timeAgo = Math.floor(Math.random() * 3600); // 0-1 hour ago
    
    const activity: ActivityItem = {
      id: `activity-${i}`,
      type: randomType,
      user: randomUser,
      timestamp: new Date(Date.now() - timeAgo * 1000),
    };

    // Add type-specific data
    switch (randomType) {
      case 'death_pool_win':
        activity.amount = Math.floor(Math.random() * 500) + 50;
        activity.poolSize = Math.floor(Math.random() * 8) + 3;
        break;
      case 'death_pool_loss':
        activity.amount = Math.floor(Math.random() * 100) + 10;
        break;
      case 'quick_roulette_win':
        activity.amount = Math.floor(Math.random() * 200) + 20;
        activity.multiplier = [2, 3, 5, 10, 50][Math.floor(Math.random() * 5)];
        break;
      case 'quick_roulette_loss':
        activity.amount = Math.floor(Math.random() * 50) + 5;
        break;
      case 'tournament_win':
        activity.amount = Math.floor(Math.random() * 1000) + 200;
        break;
      case 'achievement':
        activity.achievement = ['Survivor', 'Veteran', 'Whale', 'Diamond Hands', 'Lucky'][Math.floor(Math.random() * 5)];
        break;
      case 'big_win':
        activity.amount = Math.floor(Math.random() * 2000) + 1000;
        activity.multiplier = [10, 25, 50][Math.floor(Math.random() * 3)];
        break;
    }

    activities.push(activity);
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

interface ActivityFeedProps {
  className?: string;
}

export default function ActivityFeed({ className = "" }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'achievements'>('all');

  useEffect(() => {
    const mockActivities = generateMockActivity();
    setActivities(mockActivities);

    // Simulate new activities being added
    const interval = setInterval(() => {
      const newActivity = generateMockActivity()[0];
      newActivity.timestamp = new Date();
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 15000); // New activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'death_pool_win':
        return <Crown className="w-4 h-4 text-green-400" />;
      case 'death_pool_loss':
        return <Skull className="w-4 h-4 text-red-400" />;
      case 'quick_roulette_win':
        return <Zap className="w-4 h-4 text-green-400" />;
      case 'quick_roulette_loss':
        return <Zap className="w-4 h-4 text-red-400" />;
      case 'tournament_win':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'achievement':
        return <Target className="w-4 h-4 text-blue-400" />;
      case 'big_win':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'death_pool_win':
        return `survived death pool with ${activity.poolSize} players and won ${activity.amount} SOL`;
      case 'death_pool_loss':
        return `got rugged in death pool, lost ${activity.amount} SOL`;
      case 'quick_roulette_win':
        return `hit ${activity.multiplier}x multiplier and won ${activity.amount} SOL`;
      case 'quick_roulette_loss':
        return `lost ${activity.amount} SOL in quick roulette`;
      case 'tournament_win':
        return `won tournament and earned ${activity.amount} SOL`;
      case 'achievement':
        return `unlocked "${activity.achievement}" badge`;
      case 'big_win':
        return `hit massive ${activity.multiplier}x win for ${activity.amount} SOL!`;
      default:
        return 'had some activity';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'wins') return ['death_pool_win', 'quick_roulette_win', 'tournament_win', 'big_win'].includes(activity.type);
    if (filter === 'losses') return ['death_pool_loss', 'quick_roulette_loss'].includes(activity.type);
    if (filter === 'achievements') return activity.type === 'achievement';
    return true;
  });

  return (
    <div className={`rug-card rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-hyperbole text-xl flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Live Feed
        </h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'wins' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Wins
          </button>
          <button
            onClick={() => setFilter('losses')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'losses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Losses
          </button>
          <button
            onClick={() => setFilter('achievements')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'achievements' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Badges
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-secondary/50 ${
              activity.user.address === 'You' ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'
            }`}
          >
            {/* Avatar */}
            <img
              src={activity.user.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-lg flex-shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getActivityIcon(activity.type)}
                <span className={`font-mono text-sm ${
                  activity.user.address === 'You' ? 'text-primary' : 'text-foreground'
                }`}>
                  {activity.user.address}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getActivityText(activity)}
              </p>
            </div>

            {/* Amount Badge */}
            {activity.amount && (
              <div className={`px-2 py-1 rounded-lg text-xs font-mono ${
                ['death_pool_win', 'quick_roulette_win', 'tournament_win', 'big_win'].includes(activity.type)
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {['death_pool_win', 'quick_roulette_win', 'tournament_win', 'big_win'].includes(activity.type) ? '+' : '-'}
                {activity.amount.toFixed(1)}
              </div>
            )}
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activities to show</p>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="mt-4 pt-3 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live updates • {activities.length} recent activities
        </div>
      </div>
    </div>
  );
}