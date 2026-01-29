const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://rug-roulette-enhanced.netlify.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Game state
let currentPool = {
  id: uuidv4(),
  totalStaked: 0,
  players: [],
  timeRemaining: 300, // 5 minutes
  maxPlayers: 10,
  minStake: 1,
  maxStake: 100,
  status: 'waiting',
  winner: null,
  rugEvent: null
};

let connectedUsers = new Map();
let gameTimer = null;

// Start countdown timer
function startGameTimer() {
  if (gameTimer) clearInterval(gameTimer);
  
  gameTimer = setInterval(() => {
    if (currentPool.timeRemaining > 0) {
      currentPool.timeRemaining--;
      
      // Broadcast time update
      io.emit('pool_updated', currentPool);
      
      // Trigger rug event when timer reaches 0
      if (currentPool.timeRemaining === 0) {
        triggerRugEvent();
      }
    }
  }, 1000);
}

// Trigger rug event
function triggerRugEvent() {
  if (currentPool.players.length === 0) {
    startNewPool();
    return;
  }

  // Randomly select winner
  const winnerIndex = Math.floor(Math.random() * currentPool.players.length);
  const winner = currentPool.players[winnerIndex];

  currentPool.status = 'ended';
  currentPool.winner = winner;
  currentPool.rugEvent = {
    timestamp: new Date(),
    winner: winner,
    totalPrize: currentPool.totalStaked
  };

  // Broadcast rug event
  io.emit('rug_event', currentPool);

  // Start new pool after 5 seconds
  setTimeout(() => {
    startNewPool();
  }, 5000);
}

// Start new pool
function startNewPool() {
  currentPool = {
    id: uuidv4(),
    totalStaked: 0,
    players: [],
    timeRemaining: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
    maxPlayers: 10,
    minStake: 1,
    maxStake: 100,
    status: 'waiting',
    winner: null,
    rugEvent: null
  };

  io.emit('new_pool', currentPool);
  startGameTimer();
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current pool state
  socket.emit('pool_updated', currentPool);

  // Handle user connection with wallet
  socket.on('connect_wallet', (data) => {
    connectedUsers.set(socket.id, {
      address: data.address,
      balance: data.balance || 1000
    });
    
    socket.emit('wallet_connected', {
      address: data.address,
      balance: connectedUsers.get(socket.id).balance
    });
  });

  // Handle joining pool
  socket.on('join_pool', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'Please connect wallet first' });
      return;
    }

    const { stakeAmount } = data;

    // Validate stake amount
    if (stakeAmount < currentPool.minStake || stakeAmount > currentPool.maxStake) {
      socket.emit('error', { message: `Stake must be between ${currentPool.minStake}-${currentPool.maxStake} SOL` });
      return;
    }

    if (stakeAmount > user.balance) {
      socket.emit('error', { message: 'Insufficient balance' });
      return;
    }

    if (currentPool.players.length >= currentPool.maxPlayers) {
      socket.emit('error', { message: 'Pool is full' });
      return;
    }

    if (currentPool.status !== 'waiting') {
      socket.emit('error', { message: 'Pool is not accepting players' });
      return;
    }

    // Check if user already in pool
    if (currentPool.players.find(p => p.socketId === socket.id)) {
      socket.emit('error', { message: 'Already in pool' });
      return;
    }

    // Add player to pool
    const player = {
      id: uuidv4(),
      socketId: socket.id,
      address: user.address,
      stake: stakeAmount,
      joinedAt: new Date(),
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.address}`,
      badges: [],
      isAlive: true
    };

    currentPool.players.push(player);
    currentPool.totalStaked += stakeAmount;

    // Update user balance
    user.balance -= stakeAmount;
    connectedUsers.set(socket.id, user);

    // Start timer if first player
    if (currentPool.players.length === 1) {
      startGameTimer();
    }

    // Broadcast pool update
    io.emit('pool_updated', currentPool);
    
    socket.emit('joined_pool', {
      player: player,
      balance: user.balance
    });
  });

  // Handle quick roulette spin
  socket.on('quick_spin', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'Please connect wallet first' });
      return;
    }

    const { betAmount, multiplier } = data;

    if (betAmount > user.balance) {
      socket.emit('error', { message: 'Insufficient balance' });
      return;
    }

    // Calculate win chance based on multiplier
    const winChance = 100 / multiplier;
    const won = Math.random() * 100 < winChance;

    // Update balance
    user.balance -= betAmount;
    if (won) {
      user.balance += betAmount * multiplier;
    }

    connectedUsers.set(socket.id, user);

    socket.emit('spin_result', {
      won: won,
      amount: won ? betAmount * multiplier : -betAmount,
      balance: user.balance
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from current pool if present
    const playerIndex = currentPool.players.findIndex(p => p.socketId === socket.id);
    if (playerIndex !== -1) {
      const player = currentPool.players[playerIndex];
      currentPool.totalStaked -= player.stake;
      currentPool.players.splice(playerIndex, 1);

      // Broadcast update
      io.emit('pool_updated', currentPool);

      // If no players left, reset timer
      if (currentPool.players.length === 0 && gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
      }
    }

    connectedUsers.delete(socket.id);
  });
});

// REST API endpoints
app.get('/api/pool', (req, res) => {
  res.json(currentPool);
});

app.get('/api/stats', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    currentPool: currentPool,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Rug Roulette Backend running on port ${PORT}`);
  
  // Start initial pool
  startNewPool();
});

module.exports = { app, io };