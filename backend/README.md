# Rug Roulette Backend

Real-time game backend for Rug Roulette with WebSocket support.

## Features

- **Real-time gameplay** - WebSocket connections for instant updates
- **Death Pool mechanics** - Real stake management and rug events
- **Quick Roulette** - Instant multiplier betting
- **User management** - Balance tracking and validation
- **Pool management** - Automatic pool creation and timing

## Setup

```bash
cd backend
npm install
npm run dev
```

## API Endpoints

- `GET /api/pool` - Get current pool state
- `GET /api/stats` - Get server statistics

## WebSocket Events

### Client -> Server
- `connect_wallet` - Connect user wallet
- `join_pool` - Join current death pool
- `quick_spin` - Place quick roulette bet

### Server -> Client
- `pool_updated` - Pool state changed
- `new_pool` - New pool started
- `rug_event` - Rug event occurred
- `wallet_connected` - Wallet connection confirmed
- `joined_pool` - Successfully joined pool
- `spin_result` - Quick spin result
- `error` - Error message

## Deployment

Deploy to Heroku or Railway for production use.

```bash
# Heroku
heroku create rug-roulette-backend
git push heroku main

# Railway
railway login
railway init
railway up
```