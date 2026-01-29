# 🎰 Rug Roulette

A high-stakes, crypto-themed roulette game with a clean, minimal UI inspired by BagRace and PumpBet.fun.

## Features

- 🎯 **Target-based betting** - Pick a multiplier and win if the result is equal or higher
- 🎡 **Visual roulette wheel** - Animated spinning wheel with 8 possible outcomes
- 💰 **Real-time balance tracking** - Watch your SOL balance update with each spin
- 📊 **Stats & History** - Track your performance and view recent spins
- 🎨 **Clean dark UI** - Black background with subtle borders, glassmorphism effects
- 🔤 **Custom fonts** - Hyperbole for headings, Bambino for body text

## Game Mechanics

| Multiplier | Probability | Payout |
|------------|-------------|--------|
| 0x (Rug)   | 15%         | 0x     |
| 0.5x       | 10%         | 0.5x   |
| 1x         | 10%         | 1x     |
| 1.5x       | 10%         | 1.5x   |
| 2x         | 20%         | 2x     |
| 3x         | 15%         | 3x     |
| 5x         | 10%         | 5x     |
| 10x        | 10%         | 10x    |

**House edge:** 5% | **RTP:** 95%

## How to Play

1. **Set your bet** - Choose how much SOL to risk
2. **Pick a target** - Select a multiplier (2x, 3x, 5x, or 10x)
3. **Spin** - Click the SPIN button and watch the wheel
4. **Win** - If the result is equal to or higher than your target, you win!

⚠️ **Watch out for the rug pull!** (0x multiplier)

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- TypeScript
- Lucide React icons

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

Static files will be in the `dist` folder.

## Credits

- UI inspired by [BagRace.fun](https://bagrace.fun)
- Fonts: Hyperbole & Bambino (custom)
- Built for Alex @venture_alex
