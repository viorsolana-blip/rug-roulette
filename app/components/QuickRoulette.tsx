"use client";

import { useState, useEffect } from "react";
import { Zap, RotateCcw, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface QuickBet {
  multiplier: number;
  color: string;
  probability: number;
  label: string;
}

const QUICK_BETS: QuickBet[] = [
  { multiplier: 1.2, color: "#22c55e", probability: 80, label: "1.2x" },
  { multiplier: 2, color: "#3b82f6", probability: 50, label: "2x" },
  { multiplier: 3, color: "#8b5cf6", probability: 33, label: "3x" },
  { multiplier: 5, color: "#f59e0b", probability: 20, label: "5x" },
  { multiplier: 10, color: "#ef4444", probability: 10, label: "10x" },
  { multiplier: 50, color: "#dc2626", probability: 2, label: "50x" },
];

interface QuickRouletteProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  className?: string;
}

export default function QuickRoulette({ balance, onBalanceUpdate, className = "" }: QuickRouletteProps) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{ won: boolean; amount: number; multiplier: number } | null>(null);
  const [recentResults, setRecentResults] = useState<boolean[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalBets: 0,
    totalWon: 0,
    biggestWin: 0,
    currentStreak: 0
  });

  const adjustBet = (direction: "up" | "down") => {
    const multiplier = direction === "up" ? 2 : 0.5;
    setBetAmount(prev => Math.min(Math.max(Math.round(prev * multiplier * 100) / 100, 0.1), balance));
  };

  const setMaxBet = () => setBetAmount(Math.floor(balance * 100) / 100);
  const setHalfBet = () => setBetAmount(Math.floor(balance * 50) / 100);

  const spin = () => {
    if (!selectedMultiplier || betAmount > balance || betAmount <= 0 || isSpinning) return;

    setIsSpinning(true);
    onBalanceUpdate(balance - betAmount);

    // Simulate spin with realistic timing
    setTimeout(() => {
      const selectedBet = QUICK_BETS.find(bet => bet.multiplier === selectedMultiplier);
      if (!selectedBet) return;

      const randomResult = Math.random() * 100;
      const won = randomResult < selectedBet.probability;

      let winAmount = 0;
      if (won) {
        winAmount = betAmount * selectedMultiplier;
        onBalanceUpdate(balance - betAmount + winAmount);
      }

      setLastResult({
        won,
        amount: won ? winAmount : -betAmount,
        multiplier: selectedMultiplier
      });

      // Update stats
      setQuickStats(prev => {
        const newStreak = won ? prev.currentStreak + 1 : 0;
        const newBiggestWin = won && winAmount > prev.biggestWin ? winAmount : prev.biggestWin;
        
        return {
          totalBets: prev.totalBets + 1,
          totalWon: won ? prev.totalWon + winAmount : prev.totalWon,
          biggestWin: newBiggestWin,
          currentStreak: newStreak
        };
      });

      // Update recent results (last 10)
      setRecentResults(prev => [won, ...prev.slice(0, 9)]);

      setIsSpinning(false);
      setSelectedMultiplier(null);
    }, 2000);
  };

  const getStreakColor = () => {
    if (quickStats.currentStreak === 0) return "text-muted-foreground";
    if (quickStats.currentStreak < 3) return "text-yellow-400";
    if (quickStats.currentStreak < 5) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className={`rug-card rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-hyperbole text-xl flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Quick Roulette
        </h3>
        <div className="text-xs text-muted-foreground">
          Instant results
        </div>
      </div>

      {/* Bet Amount */}
      <div className="mb-6">
        <label className="block text-sm font-bambino mb-2">Bet Amount</label>
        <div className="relative mb-3">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(0.1, Math.min(balance, Number(e.target.value))))}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-center font-mono text-xl focus:outline-none focus:border-primary/50 transition-colors"
            disabled={isSpinning}
            step="0.1"
            min="0.1"
            max={balance}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">SOL</span>
        </div>

        {/* Quick Adjust */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => adjustBet("down")}
            disabled={isSpinning}
            className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-colors disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => adjustBet("up")}
            disabled={isSpinning}
            className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border transition-colors disabled:opacity-50"
          >
            <ChevronUp className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Quick Buttons */}
        <div className="flex gap-2">
          <button
            onClick={setHalfBet}
            disabled={isSpinning}
            className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border text-xs font-bambino transition-colors disabled:opacity-50"
          >
            1/2
          </button>
          <button
            onClick={setMaxBet}
            disabled={isSpinning}
            className="flex-1 py-2 rounded-lg bg-muted hover:bg-secondary border border-border text-xs font-bambino transition-colors disabled:opacity-50"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Multiplier Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bambino mb-3">Choose Multiplier</label>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_BETS.map((bet) => (
            <button
              key={bet.multiplier}
              onClick={() => setSelectedMultiplier(bet.multiplier)}
              disabled={isSpinning}
              className={`p-3 rounded-xl border-2 transition-all disabled:opacity-50 ${
                selectedMultiplier === bet.multiplier
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted hover:bg-secondary'
              }`}
            >
              <div className="text-sm font-hyperbole" style={{ color: bet.color }}>
                {bet.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {bet.probability}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={!selectedMultiplier || betAmount > balance || betAmount <= 0 || isSpinning}
        className={`w-full py-4 rounded-xl font-hyperbole text-xl transition-all duration-300 ${
          isSpinning
            ? 'bg-accent/20 text-accent animate-pulse cursor-wait'
            : !selectedMultiplier || betAmount > balance || betAmount <= 0
            ? 'bg-muted cursor-not-allowed text-muted-foreground'
            : 'bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isSpinning ? (
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5 animate-spin" />
            SPINNING...
          </div>
        ) : (
          `SPIN ${selectedMultiplier ? `${selectedMultiplier}x` : ''}`
        )}
      </button>

      {/* Last Result */}
      {lastResult && !isSpinning && (
        <div className={`mt-4 p-4 rounded-xl text-center border ${
          lastResult.won 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="font-hyperbole text-lg">
            {lastResult.won ? 'WIN!' : 'LOSE!'}
          </div>
          <div className="font-mono">
            {lastResult.won ? '+' : ''}{lastResult.amount.toFixed(2)} SOL
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="mt-4">
          <label className="block text-xs font-bambino mb-2 text-muted-foreground">Recent Results</label>
          <div className="flex gap-1">
            {recentResults.map((won, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {won ? '✓' : '✕'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-mono text-primary">{quickStats.totalBets}</div>
            <div className="text-xs text-muted-foreground">Total Spins</div>
          </div>
          <div>
            <div className="text-sm font-mono text-primary">
              {quickStats.totalWon.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Total Won</div>
          </div>
          <div>
            <div className="text-sm font-mono text-accent">
              {quickStats.biggestWin.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Biggest Win</div>
          </div>
          <div>
            <div className={`text-sm font-mono ${getStreakColor()}`}>
              {quickStats.currentStreak}🔥
            </div>
            <div className="text-xs text-muted-foreground">Win Streak</div>
          </div>
        </div>
      </div>

      {betAmount > balance && (
        <p className="text-center text-xs text-destructive mt-2">Insufficient balance</p>
      )}
    </div>
  );
}