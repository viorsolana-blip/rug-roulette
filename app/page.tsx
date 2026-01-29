"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Zap,
  Trophy,
  Wallet,
  Clock,
  Skull,
  Info,
  Volume2,
  VolumeX,
  Timer,
  Crown,
  Shield,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Copy,
  ExternalLink,
  Sun,
  Moon
} from "lucide-react";

// Import new components
import Leaderboard from "./components/Leaderboard";
import QuickRoulette from "./components/QuickRoulette";
import Tournament from "./components/Tournament";
import ActivityFeed from "./components/ActivityFeed";

// Pool game constants
interface Player {
  id: string;
  address: string;
  stake: number;
  joinedAt: Date;
  avatar: string;
  badges: string[];
  isAlive: boolean;
}

interface GamePool {
  id: string;
  totalStaked: number;
  players: Player[];
  timeRemaining: number;
  maxPlayers: number;
  minStake: number;
  maxStake: number;
  status: 'waiting' | 'active' | 'ended';
  winner?: Player;
  rugEvent?: {
    timestamp: Date;
    winner: Player;
    totalPrize: number;
  };
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const BADGES: Badge[] = [
  { id: 'survivor', name: 'Survivor', icon: 'Shield', description: 'Won a rug roulette', color: '#22c55e' },
  { id: 'veteran', name: 'Veteran', icon: 'Target', description: '10+ games played', color: '#3b82f6' },
  { id: 'whale', name: 'Whale', icon: 'TrendingUp', description: 'Staked 100+ SOL', color: '#8b5cf6' },
  { id: 'lucky', name: 'Lucky', icon: 'Sparkles', description: 'Won 3 in a row', color: '#10b981' },
  { id: 'diamond', name: 'Diamond Hands', icon: 'Crown', description: 'Survived 5 rugs', color: '#06b6d4' },
];

// Generate mock players
const generateMockPlayers = (count: number): Player[] => {
  const addresses = [
    '8ZqJ...kL9m', '9aBc...nP3x', '7XyZ...qR5t', '6WuV...sT8v', '5PqR...uY2w',
    '4MnO...wZ7a', '3KjI...yA9b', '2HgF...xC4d', '1DeF...vB6e', 'ZcXv...tN8f'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    address: addresses[i % addresses.length],
    stake: Math.floor(Math.random() * 50) + 5, // 5-55 SOL
    joinedAt: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`,
    badges: Math.random() > 0.7 ? [BADGES[Math.floor(Math.random() * BADGES.length)].id] : [],
    isAlive: true,
  }));
};

// Betting options for roulette
const BET_OPTIONS = [
  { multiplier: 2, label: "2x", color: "#22c55e", probability: "50%" },
  { multiplier: 5, label: "5x", color: "#3b82f6", probability: "20%" },
  { multiplier: 10, label: "10x", color: "#8b5cf6", probability: "10%" },
  { multiplier: 50, label: "50x", color: "#ef4444", probability: "2%" },
];

// Tab configuration
const TABS = [
  { id: 'death-pool', label: 'Death Pool', icon: Skull, color: '#ef4444' },
  { id: 'quick-roulette', label: 'Quick Roulette', icon: Zap, color: '#3b82f6' },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy, color: '#f59e0b' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown, color: '#8b5cf6' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function RugRoulette() {
  const [balance, setBalance] = useState(1000);
  const [stakeAmount, setStakeAmount] = useState(10);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPool, setCurrentPool] = useState<GamePool>({
    id: 'pool-1',
    totalStaked: 0,
    players: [],
    timeRemaining: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
    maxPlayers: 10,
    minStake: 1,
    maxStake: 100,
    status: 'waiting'
  });
  const [userInPool, setUserInPool] = useState(false);
  const [showRugEvent, setShowRugEvent] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [recentPools, setRecentPools] = useState<GamePool[]>([]);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 12,
    gamesWon: 3,
    totalStaked: 245.6,
    totalWon: 189.2,
    badges: ['survivor', 'veteran']
  });
  const [activeTab, setActiveTab] = useState<TabId>('death-pool');
  const [darkMode, setDarkMode] = useState(true);
  
  // Mock contract address and social links
  const contractAddress = "7xKRK8G9L2mF3vBnP8wC4A1tXsY9dQ2eR5nM6uH8jV3z";
  const pumpFunUrl = "https://pump.fun/coin/7xKRK8G9L2mF3vBnP8wC4A1tXsY9dQ2eR5nM6uH8jV3z";

  // Generate initial mock players
  useEffect(() => {
    const mockPlayers = generateMockPlayers(Math.floor(Math.random() * 6) + 2); // 2-7 players
    setCurrentPool(prev => ({
      ...prev,
      players: mockPlayers,
      totalStaked: mockPlayers.reduce((sum, p) => sum + p.stake, 0)
    }));
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (currentPool.status === 'waiting' && currentPool.timeRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentPool(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            // Trigger rug event
            triggerRugEvent(prev);
            return { ...prev, timeRemaining: 0, status: 'ended' };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPool.status, currentPool.timeRemaining]);

  const triggerRugEvent = (pool: GamePool) => {
    // Randomly select winner
    const alivePlayers = pool.players.filter(p => p.isAlive);
    if (alivePlayers.length > 0) {
      const winnerIndex = Math.floor(Math.random() * alivePlayers.length);
      const winner = alivePlayers[winnerIndex];

      const rugEvent = {
        timestamp: new Date(),
        winner,
        totalPrize: pool.totalStaked
      };

      setCurrentPool(prev => ({ ...prev, winner, rugEvent, status: 'ended' }));
      setShowRugEvent(true);

      // If user was the winner
      if (userInPool && winner.address === 'You') {
        setBalance(prev => prev + pool.totalStaked);
      }

      // Move to recent pools
      setTimeout(() => {
        setRecentPools(prev => [{ ...pool, winner, rugEvent, status: 'ended' }, ...prev.slice(0, 9)]);
        // Start new pool
        startNewPool();
        setShowRugEvent(false);
      }, 5000);
    }
  };

  const startNewPool = () => {
    const newPlayers = generateMockPlayers(Math.floor(Math.random() * 4) + 1);
    setCurrentPool({
      id: `pool-${Date.now()}`,
      totalStaked: newPlayers.reduce((sum, p) => sum + p.stake, 0),
      players: newPlayers,
      timeRemaining: Math.floor(Math.random() * 300) + 60,
      maxPlayers: 10,
      minStake: 1,
      maxStake: 100,
      status: 'waiting'
    });
    setUserInPool(false);
  };

  const joinPool = useCallback(() => {
    if (userInPool || stakeAmount > balance || stakeAmount < currentPool.minStake || stakeAmount > currentPool.maxStake) return;

    const userPlayer: Player = {
      id: 'user',
      address: 'You',
      stake: stakeAmount,
      joinedAt: new Date(),
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user',
      badges: userStats.badges,
      isAlive: true
    };

    setBalance(prev => prev - stakeAmount);
    setUserInPool(true);
    setCurrentPool(prev => ({
      ...prev,
      players: [...prev.players, userPlayer],
      totalStaked: prev.totalStaked + stakeAmount
    }));
  }, [userInPool, stakeAmount, balance, currentPool.minStake, currentPool.maxStake, userStats.badges]);

  const adjustStake = (direction: "up" | "down") => {
    const multiplier = direction === "up" ? 2 : 0.5;
    setStakeAmount(prev => Math.min(Math.max(Math.round(prev * multiplier), currentPool.minStake), Math.min(balance, currentPool.maxStake)));
  };

  const setMaxStake = () => setStakeAmount(Math.min(balance, currentPool.maxStake));
  const setHalfStake = () => setStakeAmount(Math.floor(Math.min(balance, currentPool.maxStake) / 2));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy CA:', err);
    }
  };

  const openPumpFun = () => {
    window.open(pumpFunUrl, '_blank');
  };

  // Helper function to render badge icons
  const renderBadgeIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (iconName) {
      case 'Shield':
        return <Shield {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'TrendingUp':
        return <TrendingUp {...iconProps} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'Crown':
        return <Crown {...iconProps} />;
      default:
        return <Trophy {...iconProps} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/rug-logo.svg"
                alt="Rug Roulette"
                className="w-10 h-10 rounded-xl shadow-lg shadow-red-500/20"
              />
              <div className="flex flex-col">
                <span className="font-hyperbole text-xl tracking-wide text-foreground">Rug Roulette</span>
                <span className="text-[10px] text-muted-foreground font-bambino -mt-1">Will you survive?</span>
              </div>
            </div>

            {/* Balance & Controls */}
            <div className="flex items-center gap-2">
              {/* Copy CA Button */}
              <button
                onClick={copyCA}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bambino font-semibold text-sm transition-all duration-200"
                title="Copy Contract Address"
              >
                <Copy className="w-4 h-4" />
                <span>Copy CA</span>
              </button>
              
              {/* PumpFun Button */}
              <button
                onClick={openPumpFun}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bambino font-semibold text-sm transition-all duration-200"
                title="Open on PumpFun"
              >
                <ExternalLink className="w-4 h-4" />
                <span>PumpFun</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-muted hover:bg-secondary border border-border transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-primary" />
                ) : (
                  <Moon className="w-4 h-4 text-primary" />
                )}
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-muted hover:bg-secondary border border-border transition-colors"
                title="Toggle Sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* Balance */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">{balance.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">SOL</span>
              </div>

              {/* Connect Button */}
              <button className="px-4 py-2 rounded-xl bg-primary hover:bg-accent text-primary-foreground font-bambino font-semibold text-sm transition-all duration-200">
                Connect
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Mobile Balance & Controls */}
        <div className="sm:hidden space-y-3 mb-6">
          {/* Balance */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border">
            <span className="text-sm text-muted-foreground">Balance</span>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-mono">{balance.toFixed(2)} SOL</span>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyCA}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bambino font-semibold text-sm transition-all duration-200"
            >
              <Copy className="w-4 h-4" />
              <span>Copy CA</span>
            </button>
            <button
              onClick={openPumpFun}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bambino font-semibold text-sm transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>PumpFun</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bambino font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                  <span className="text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - User Stats & Badges */}
          <div className="lg:col-span-3 space-y-4">
            {/* User Stats */}
            <div className="rug-card rounded-2xl p-5">
              <h3 className="font-hyperbole text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Your Stats
              </h3>
              <div className="space-y-3">
                <StatRow label="Games Played" value={userStats.gamesPlayed.toString()} />
                <StatRow label="Games Won" value={userStats.gamesWon.toString()} positive />
                <StatRow label="Win Rate" value={`${Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)}%`} highlight />
                <StatRow label="Total Staked" value={`${userStats.totalStaked.toFixed(1)} SOL`} />
                <StatRow label="Total Won" value={`${userStats.totalWon.toFixed(1)} SOL`} positive />
              </div>
            </div>

            {/* Badges */}
            <div className="rug-card rounded-2xl p-5">
              <h3 className="font-hyperbole text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Badges
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {BADGES.slice(0, 4).map((badge) => {
                  const hasBadge = userStats.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border transition-all ${
                        hasBadge
                          ? 'bg-secondary/50 border-primary/30'
                          : 'bg-muted border-border opacity-50'
                      }`}
                      title={badge.description}
                    >
                      <div className="mb-1">{renderBadgeIcon(badge.icon)}</div>
                      <div className="text-xs font-bambino">{badge.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Center Column - Dynamic Content */}
          <div className="lg:col-span-6">
            {activeTab === 'death-pool' && (
              <div className="rug-card rounded-3xl p-6 sm:p-8 relative">
                {/* Pool Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Skull className="w-8 h-8 text-destructive" />
                    <h2 className="font-hyperbole text-3xl gradient-text">Death Pool</h2>
                    <Skull className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-muted-foreground font-bambino">
                    Stake SOL, wait for the rug... Only one survives to claim the entire pool.
                  </p>
                </div>

                {/* Timer */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                    <Timer className={`w-6 h-6 text-destructive ${currentPool.timeRemaining < 30 ? 'animate-pulse' : ''}`} />
                    <div>
                      <div className="text-xs text-destructive font-bambino mb-1">Time Until Rug Event</div>
                      <div className={`font-hyperbole text-2xl ${currentPool.timeRemaining < 30 ? 'text-destructive' : 'text-foreground'}`}>
                        {formatTime(currentPool.timeRemaining)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-2xl font-hyperbole text-primary">{currentPool.totalStaked.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground font-bambino">Total Pool</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-2xl font-hyperbole text-accent">{currentPool.players.length}</div>
                    <div className="text-xs text-muted-foreground font-bambino">Players</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-2xl font-hyperbole text-chart-3">{Math.round((1 / currentPool.players.length) * 100)}%</div>
                    <div className="text-xs text-muted-foreground font-bambino">Win Chance</div>
                  </div>
                </div>

                {/* Players List */}
                <div className="mb-8">
                  <h3 className="font-hyperbole text-lg mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Players in Pool ({currentPool.players.length}/{currentPool.maxPlayers})
                  </h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {currentPool.players.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                          player.address === 'You' ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-lg"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-sm ${player.address === 'You' ? 'text-green-400' : 'text-foreground'}`}>
                                {player.address}
                              </span>
                              {player.badges.length > 0 && (
                                <div className="flex gap-1">
                                  {player.badges.slice(0, 2).map(badgeId => {
                                    const badge = BADGES.find(b => b.id === badgeId);
                                    return badge ? (
                                      <span key={badge.id} className="text-xs" title={badge.name}>
                                        {renderBadgeIcon(badge.icon)}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined {Math.floor((Date.now() - player.joinedAt.getTime()) / 1000)}s ago
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-green-400">{player.stake} SOL</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((player.stake / currentPool.totalStaked) * 100)}% of pool
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rug Event Overlay */}
                {showRugEvent && currentPool.rugEvent && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 rounded-3xl">
                    <div className="animate-bounce-in bg-red-500/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500 text-center max-w-sm">
                      <Skull className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-400 font-hyperbole text-2xl mb-2">RUG PULLED!</p>
                      <p className="text-white font-bambino mb-4">
                        <span className="text-green-400 font-mono">{currentPool.rugEvent.winner.address}</span> survives
                      </p>
                      <p className="text-green-400 font-hyperbole text-3xl">
                        +{currentPool.rugEvent.totalPrize.toFixed(1)} SOL
                      </p>
                    </div>
                  </div>
                )}

                {/* Game Rules */}
                <div className="text-center text-xs text-gray-500">
                  <Info className="w-3 h-3 inline mr-1" />
                  Winner takes all • Random timer • Equal chance for all players
                </div>
              </div>
            )}

            {activeTab === 'quick-roulette' && (
              <QuickRoulette 
                balance={balance} 
                onBalanceUpdate={setBalance} 
              />
            )}

            {activeTab === 'tournaments' && (
              <Tournament balance={balance} />
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard />
            )}
          </div>

          {/* Right Column - Tab-specific content */}
          <div className="lg:col-span-3 space-y-4">
            {activeTab === 'death-pool' && (
              <>
                {/* Stake Amount */}
                <div className="rug-card rounded-2xl p-5">
                  <h3 className="font-hyperbole text-lg mb-4 text-foreground">Stake Amount</h3>

                  <div className="relative mb-4">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Math.max(currentPool.minStake, Math.min(balance, Number(e.target.value))))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-center font-mono text-2xl focus:outline-none focus:border-primary/50 transition-colors text-foreground"
                      disabled={userInPool || currentPool.status !== 'waiting'}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">SOL</span>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4 text-center">
                    Min: {currentPool.minStake} SOL • Max: {currentPool.maxStake} SOL
                  </div>

                  {/* Quick Adjust */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => adjustStake("down")}
                      disabled={userInPool}
                      className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-colors disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => adjustStake("up")}
                      disabled={userInPool}
                      className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-colors disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  {/* Quick Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={setHalfStake}
                      disabled={userInPool}
                      className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border text-xs font-bambino transition-colors disabled:opacity-50"
                    >
                      1/2
                    </button>
                    <button
                      onClick={setMaxStake}
                      disabled={userInPool}
                      className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border text-xs font-bambino transition-colors disabled:opacity-50"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Join Pool Button */}
                <button
                  onClick={joinPool}
                  disabled={userInPool || stakeAmount > balance || stakeAmount < currentPool.minStake || stakeAmount > currentPool.maxStake || currentPool.status !== 'waiting'}
                  className={`w-full py-5 rounded-2xl font-hyperbole text-2xl transition-all duration-300 ${
                    userInPool || currentPool.status !== 'waiting'
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : stakeAmount > balance || stakeAmount < currentPool.minStake || stakeAmount > currentPool.maxStake
                      ? 'bg-destructive/20 cursor-not-allowed text-destructive'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {userInPool ? 'IN POOL' : currentPool.status !== 'waiting' ? 'POOL ENDED' : 'JOIN POOL'}
                </button>

                {userInPool && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-xs text-green-400 mb-1">You're in!</p>
                    <p className="font-hyperbole text-xl text-green-400">
                      {stakeAmount} SOL staked
                    </p>
                  </div>
                )}
                {stakeAmount > balance && (
                  <p className="text-center text-xs text-destructive">Insufficient balance</p>
                )}
                {(stakeAmount < currentPool.minStake || stakeAmount > currentPool.maxStake) && (
                  <p className="text-center text-xs text-destructive">
                    Stake must be between {currentPool.minStake}-{currentPool.maxStake} SOL
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live Activity Feed - Always show at bottom */}
        <div className="mt-8">
          <ActivityFeed />
        </div>

        {/* How It Works - Show for Death Pool only */}
        {activeTab === 'death-pool' && (
          <div className="mt-8 rug-card rounded-2xl p-6">
            <h3 className="font-hyperbole text-xl mb-4 text-foreground">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="font-hyperbole text-green-400">1</span>
                </div>
                <h4 className="font-bambino font-semibold mb-1 text-foreground">Set Your Stake</h4>
                <p className="text-sm text-muted-foreground">Choose how much SOL you want to risk</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="font-hyperbole text-blue-400">2</span>
                </div>
                <h4 className="font-bambino font-semibold mb-1 text-foreground">Wait for Others</h4>
                <p className="text-sm text-muted-foreground">Other players join the death pool</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="font-hyperbole text-purple-400">3</span>
                </div>
                <h4 className="font-bambino font-semibold mb-1 text-foreground">Survive & Win</h4>
                <p className="text-sm text-muted-foreground">One random survivor claims the entire pool</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatRow({ label, value, positive, negative, highlight }: { 
  label: string; 
  value: string; 
  positive?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-mono text-sm ${
        positive ? 'text-green-400' : 
        negative ? 'text-red-400' : 
        highlight ? 'text-yellow-400' : 
        'text-white'
      }`}>
        {value}
      </span>
    </div>
  );
}