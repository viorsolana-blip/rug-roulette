import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/app/lib/socket';

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

interface SpinResult {
  won: boolean;
  amount: number;
  balance: number;
}

export function useGameSocket() {
  const [connected, setConnected] = useState(false);
  const [currentPool, setCurrentPool] = useState<GamePool | null>(null);
  const [balance, setBalance] = useState(1000);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rugEvent, setRugEvent] = useState<GamePool['rugEvent'] | null>(null);

  useEffect(() => {
    // Connection status
    socketService.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketService.on('disconnect', () => {
      setConnected(false);
    });

    // Pool updates
    socketService.on('pool_updated', (pool: GamePool) => {
      setCurrentPool({
        ...pool,
        players: pool.players.map(p => ({
          ...p,
          joinedAt: new Date(p.joinedAt)
        }))
      });
    });

    socketService.on('new_pool', (pool: GamePool) => {
      setCurrentPool({
        ...pool,
        players: pool.players.map(p => ({
          ...p,
          joinedAt: new Date(p.joinedAt)
        }))
      });
      setRugEvent(null);
    });

    // Rug event
    socketService.on('rug_event', (pool: GamePool) => {
      setCurrentPool({
        ...pool,
        players: pool.players.map(p => ({
          ...p,
          joinedAt: new Date(p.joinedAt)
        }))
      });
      if (pool.rugEvent) {
        setRugEvent({
          ...pool.rugEvent,
          timestamp: new Date(pool.rugEvent.timestamp)
        });
      }
    });

    // Wallet connection
    socketService.on('wallet_connected', (data: { address: string; balance: number }) => {
      setUserAddress(data.address);
      setBalance(data.balance);
    });

    // Pool join success
    socketService.on('joined_pool', (data: { player: Player; balance: number }) => {
      setBalance(data.balance);
    });

    // Quick spin result
    socketService.on('spin_result', (result: SpinResult) => {
      setBalance(result.balance);
    });

    // Error handling
    socketService.on('error', (err: { message: string }) => {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      // Cleanup listeners
      socketService.off('connect', () => {});
      socketService.off('disconnect', () => {});
      socketService.off('pool_updated', () => {});
      socketService.off('new_pool', () => {});
      socketService.off('rug_event', () => {});
      socketService.off('wallet_connected', () => {});
      socketService.off('joined_pool', () => {});
      socketService.off('spin_result', () => {});
      socketService.off('error', () => {});
    };
  }, []);

  const connectWallet = useCallback((address: string) => {
    socketService.connectWallet(address, balance);
  }, [balance]);

  const joinPool = useCallback((stakeAmount: number) => {
    socketService.joinPool(stakeAmount);
  }, []);

  const quickSpin = useCallback((betAmount: number, multiplier: number) => {
    return new Promise<SpinResult>((resolve) => {
      const handler = (result: SpinResult) => {
        socketService.off('spin_result', handler);
        resolve(result);
      };
      socketService.on('spin_result', handler);
      socketService.quickSpin(betAmount, multiplier);
    });
  }, []);

  return {
    connected,
    currentPool,
    balance,
    userAddress,
    error,
    rugEvent,
    connectWallet,
    joinPool,
    quickSpin
  };
}