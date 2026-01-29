"use client";

import { useState, useEffect } from "react";
import { Trophy, Users, Clock, Star, Crown, Zap, Calendar } from "lucide-react";

interface TournamentPlayer {
  id: string;
  address: string;
  avatar: string;
  points: number;
  gamesPlayed: number;
  position: number;
  eliminated: boolean;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  buyIn: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'upcoming' | 'registration' | 'active' | 'finished';
  timeRemaining: number;
  players: TournamentPlayer[];
  rules: string[];
  rewards: {
    first: number;
    second: number;
    third: number;
  };
}

const generateMockTournaments = (): Tournament[] => [
  {
    id: 'daily-1',
    name: 'Daily Death Match',
    description: 'Survive 5 rounds to claim the crown',
    buyIn: 50,
    prizePool: 500,
    maxPlayers: 20,
    currentPlayers: 16,
    status: 'registration',
    timeRemaining: 1847, // 30 minutes
    players: [],
    rules: [
      'Entry fee: 50 SOL',
      '5 rounds of elimination',
      'Last 3 survivors split the prize',
      'No re-entries allowed'
    ],
    rewards: {
      first: 250,
      second: 150,
      third: 100
    }
  },
  {
    id: 'weekly-1',
    name: 'Whale Wars',
    description: 'High stakes tournament for serious players',
    buyIn: 200,
    prizePool: 2400,
    maxPlayers: 12,
    currentPlayers: 8,
    status: 'registration',
    timeRemaining: 7200, // 2 hours
    players: [],
    rules: [
      'Entry fee: 200 SOL',
      'Single elimination',
      'Winner takes 60% of prize pool',
      'Premium badges awarded'
    ],
    rewards: {
      first: 1440,
      second: 600,
      third: 360
    }
  },
  {
    id: 'newbie-1',
    name: 'Rookie Rumble',
    description: 'For players with <10 games played',
    buyIn: 10,
    prizePool: 120,
    maxPlayers: 16,
    currentPlayers: 12,
    status: 'registration',
    timeRemaining: 3600, // 1 hour
    players: [],
    rules: [
      'Entry fee: 10 SOL',
      'Only for rookies (<10 games)',
      'Teaching tournament',
      'Everyone gets participation badge'
    ],
    rewards: {
      first: 60,
      second: 36,
      third: 24
    }
  }
];

const generateMockTournamentPlayers = (): TournamentPlayer[] => [
  { id: '1', address: 'Rug...Lord', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=1', points: 850, gamesPlayed: 5, position: 1, eliminated: false },
  { id: '2', address: 'Diamond...Hand', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=2', points: 720, gamesPlayed: 5, position: 2, eliminated: false },
  { id: '3', address: 'You', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user', points: 640, gamesPlayed: 4, position: 3, eliminated: false },
  { id: '4', address: 'Whale...Hunter', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=4', points: 580, gamesPlayed: 5, position: 4, eliminated: false },
  { id: '5', address: 'Moon...Boy', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=5', points: 420, gamesPlayed: 5, position: 5, eliminated: false },
  { id: '6', address: 'Paper...Hands', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=6', points: 350, gamesPlayed: 4, position: 6, eliminated: true },
];

interface TournamentProps {
  balance: number;
  className?: string;
}

export default function Tournament({ balance, className = "" }: TournamentProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const mockTournaments = generateMockTournaments();
    setTournaments(mockTournaments);
    
    // Simulate an active tournament
    const active = { ...mockTournaments[0] };
    active.status = 'active';
    active.players = generateMockTournamentPlayers();
    setActiveTournament(active);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'text-muted-foreground';
      case 'registration': return 'text-accent';
      case 'active': return 'text-primary';
      case 'finished': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'registration': return 'Open';
      case 'active': return 'Live';
      case 'finished': return 'Finished';
      default: return 'Unknown';
    }
  };

  const registerForTournament = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament || balance < tournament.buyIn) return;

    // Simulate registration
    setUserRegistered(true);
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, currentPlayers: t.currentPlayers + 1 }
        : t
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Active Tournament */}
      {activeTournament && (
        <div className="rug-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-hyperbole text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Live Tournament
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-bambino font-semibold text-lg">{activeTournament.name}</h4>
            <p className="text-sm text-muted-foreground">{activeTournament.description}</p>
          </div>

          {/* Tournament Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-lg font-hyperbole text-primary">{activeTournament.prizePool}</div>
              <div className="text-xs text-muted-foreground">Prize Pool</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-lg font-hyperbole text-accent">{activeTournament.players.length}</div>
              <div className="text-xs text-muted-foreground">Players</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-lg font-hyperbole text-chart-3">Round 3</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <h5 className="font-bambino font-semibold text-sm mb-2">Current Standings</h5>
            {activeTournament.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  player.address === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'
                } ${
                  player.eliminated ? 'opacity-50' : ''
                }`}
              >
                <div className="w-6 text-center">
                  {player.position <= 3 ? (
                    player.position === 1 ? <Crown className="w-4 h-4 text-yellow-400" /> :
                    player.position === 2 ? <Trophy className="w-4 h-4 text-gray-300" /> :
                    <Trophy className="w-4 h-4 text-orange-400" />
                  ) : (
                    <span className="text-xs text-muted-foreground">#{player.position}</span>
                  )}
                </div>
                <img src={player.avatar} alt="Avatar" className="w-6 h-6 rounded-md" />
                <div className="flex-1">
                  <span className={`text-sm font-mono ${player.address === 'You' ? 'text-primary' : ''}`}>
                    {player.address}
                  </span>
                  {player.eliminated && (
                    <span className="text-xs text-red-400 ml-2">ELIMINATED</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-accent">{player.points}</div>
                  <div className="text-xs text-muted-foreground">{player.gamesPlayed}G</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tournaments */}
      <div className="rug-card rounded-2xl p-5">
        <h3 className="font-hyperbole text-xl mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Tournaments
        </h3>

        <div className="space-y-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors"
            >
              {/* Tournament Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bambino font-semibold">{tournament.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tournament.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-mono text-sm text-primary">{tournament.prizePool} SOL</div>
                  <div className="text-xs text-muted-foreground">Prize Pool</div>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Buy-in</div>
                  <div className="font-mono text-accent">{tournament.buyIn} SOL</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Players</div>
                  <div className="font-mono">{tournament.currentPlayers}/{tournament.maxPlayers}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time Left</div>
                  <div className="font-mono text-chart-3">{formatTime(tournament.timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">1st Prize</div>
                  <div className="font-mono text-green-400">{tournament.rewards.first} SOL</div>
                </div>
              </div>

              {/* Action Button */}
              {tournament.status === 'registration' && (
                <button
                  onClick={() => registerForTournament(tournament.id)}
                  disabled={balance < tournament.buyIn || userRegistered}
                  className={`w-full py-2 rounded-lg font-bambino text-sm transition-colors ${
                    balance < tournament.buyIn
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : userRegistered
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/80 text-primary-foreground'
                  }`}
                >
                  {balance < tournament.buyIn ? 'Insufficient Balance' : 
                   userRegistered ? 'Registered ✓' : 
                   `Register (${tournament.buyIn} SOL)`}
                </button>
              )}

              {tournament.status === 'upcoming' && (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Registration opens soon
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}