"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Medal, TrendingUp, Users, Coins } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  address: string;
  avatar: string;
  totalWinnings: number;
  gamesWon: number;
  winRate: number;
  badges: string[];
  rank: number;
  streak: number;
}

const generateMockLeaderboard = (): LeaderboardEntry[] => {
  const entries = [
    { address: "DeGen...King", totalWinnings: 2847.5, gamesWon: 89, gamesPlayed: 156, streak: 12 },
    { address: "Rug...Lord", totalWinnings: 1923.2, gamesWon: 67, gamesPlayed: 134, streak: 5 },
    { address: "Diamond...Hand", totalWinnings: 1656.8, gamesWon: 78, gamesPlayed: 189, streak: 3 },
    { address: "Whale...Hunter", totalWinnings: 1234.7, gamesWon: 45, gamesPlayed: 98, streak: 8 },
    { address: "Sigma...Chad", totalWinnings: 998.4, gamesWon: 34, gamesPlayed: 87, streak: 2 },
    { address: "Moon...Boy", totalWinnings: 756.3, gamesWon: 28, gamesPlayed: 92, streak: 1 },
    { address: "Degen...Ace", totalWinnings: 645.2, gamesWon: 22, gamesPlayed: 76, streak: 7 },
    { address: "Ape...Strong", totalWinnings: 567.8, gamesWon: 19, gamesPlayed: 54, streak: 4 },
    { address: "You", totalWinnings: 189.2, gamesWon: 3, gamesPlayed: 12, streak: 1 },
    { address: "Paper...Hands", totalWinnings: 123.4, gamesWon: 8, gamesPlayed: 67, streak: 0 }
  ];

  return entries.map((entry, index) => ({
    id: `player-${index}`,
    address: entry.address,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.address}`,
    totalWinnings: entry.totalWinnings,
    gamesWon: entry.gamesWon,
    winRate: Math.round((entry.gamesWon / entry.gamesPlayed) * 100),
    badges: index === 0 ? ['survivor', 'veteran', 'whale', 'diamond'] : 
            index < 3 ? ['survivor', 'veteran'] : 
            index < 8 ? ['survivor'] : [],
    rank: index + 1,
    streak: entry.streak
  }));
};

interface LeaderboardProps {
  className?: string;
}

export default function Leaderboard({ className = "" }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'winnings' | 'winRate' | 'streak'>('winnings');

  useEffect(() => {
    const data = generateMockLeaderboard();
    setLeaderboard(data);
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'winnings':
        return b.totalWinnings - a.totalWinnings;
      case 'winRate':
        return b.winRate - a.winRate;
      case 'streak':
        return b.streak - a.streak;
      default:
        return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="text-sm font-mono text-muted-foreground">#{rank}</span>;
    }
  };

  const getBadgeEmoji = (badgeId: string) => {
    const badges: Record<string, string> = {
      'survivor': '🛡️',
      'veteran': '⭐',
      'whale': '🐋',
      'diamond': '💎',
      'lucky': '🍀'
    };
    return badges[badgeId] || '';
  };

  return (
    <div className={`rug-card rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-hyperbole text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Leaderboard
        </h3>
        
        {/* Sort Controls */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setSortBy('winnings')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === 'winnings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="w-3 h-3" />
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === 'winRate' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              sortBy === 'streak' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {sortedLeaderboard.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-secondary/50 ${
              entry.address === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'
            }`}
          >
            {/* Rank */}
            <div className="w-8 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center gap-3 flex-1">
              <img
                src={entry.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm truncate ${
                    entry.address === 'You' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {entry.address}
                  </span>
                  {entry.badges.length > 0 && (
                    <div className="flex gap-1">
                      {entry.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className="text-xs">
                          {getBadgeEmoji(badge)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{entry.gamesWon}W</span>
                  <span>{entry.winRate}%</span>
                  {entry.streak > 0 && (
                    <span className="text-accent">🔥{entry.streak}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="font-mono text-sm text-primary">
                {entry.totalWinnings.toFixed(1)} SOL
              </div>
              <div className="text-xs text-muted-foreground">
                Total Won
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Position Highlight */}
      {leaderboard.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="text-center text-xs text-primary">
            You're ranked #{leaderboard.find(e => e.address === 'You')?.rank || 'N/A'} 
            {' '}with {leaderboard.find(e => e.address === 'You')?.totalWinnings.toFixed(1)} SOL won
          </div>
        </div>
      )}
    </div>
  );
}