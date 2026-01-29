import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rug-roulette-backend.herokuapp.com' // We'll deploy backend here
      : 'http://localhost:5000';

    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('🚀 Connected to Rug Roulette backend');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
    });

    // Set up event forwarding
    this.socket.onAny((event, ...args) => {
      const handlers = this.callbacks.get(event) || [];
      handlers.forEach(handler => handler(...args));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const handlers = this.callbacks.get(event) || [];
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // Game-specific methods
  connectWallet(address: string, balance: number = 1000) {
    this.emit('connect_wallet', { address, balance });
  }

  joinPool(stakeAmount: number) {
    this.emit('join_pool', { stakeAmount });
  }

  quickSpin(betAmount: number, multiplier: number) {
    this.emit('quick_spin', { betAmount, multiplier });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Auto-connect when imported
if (typeof window !== 'undefined') {
  socketService.connect();
}