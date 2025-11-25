# Type Type - Multiplayer Typing Game

A high-speed competitive typing game where players race to type words before a bouncing ball reaches their side of the screen.

## 🎮 Features

- **Single Player Mode**: Play against yourself or test the game mechanics
- **Multiplayer Mode**: Challenge a friend from anywhere via WebSocket connection
- **Progressive Difficulty**: Words get harder and ball moves faster with each volley
- **Real-time Animation**: Smooth 60fps ball physics and visual effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Score Tracking**: Tracks volleys, accuracy, and response time

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Local Development (Single Player)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Local Development (Multiplayer)

```bash
# Install dependencies (if not already done)
npm install

# Terminal 1: Start the Next.js app
npm run dev

# Terminal 2: Start the WebSocket server
npm run server

# Open http://localhost:3000 in your browser
# Navigate to "Play Online" to create or join a room
```

Or use concurrently to run both:

```bash
npm install -g concurrently
npm run dev:all
```

## 📁 Project Structure

```
typetype/
├── app/
│   ├── page.tsx              # Home menu
│   ├── game/
│   │   └── page.tsx          # Single player game
│   └── multiplayer/
│       └── page.tsx          # Multiplayer lobby
├── components/
│   ├── GameCanvas.tsx        # Ball animation & rendering
│   ├── InputField.tsx        # Typing input
│   ├── GameUI.tsx            # Score display
│   └── GameOver.tsx          # End screen
├── hooks/
│   ├── useGameState.ts       # Game state management
│   └── useWebSocket.ts       # Multiplayer connection
├── lib/
│   ├── gameEngine.ts         # Ball physics & collision
│   ├── gameState.ts          # State helpers
│   └── types.ts              # TypeScript types
├── constants/
│   ├── gameConfig.ts         # Game settings
│   └── words.ts              # Word lists
├── server.js                 # WebSocket server
└── package.json
```

## 🎯 Gameplay

### How to Play

1. **Start**: Click "Play Solo" or "Play Online"
2. **Type**: Watch for the word displayed on screen
3. **Submit**: Type the word and press Enter before the ball reaches your wall
4. **Win**: Each successful word bounces the ball back - survive as long as you can!
5. **Lose**: If the ball hits your wall before you type the word correctly, game over

### Difficulty Progression

- **Levels 1-3**: Easy words (3-5 characters)
- **Levels 4-7**: Medium words (7-12 characters)
- **Levels 8-12**: Hard words (8-15 characters)
- **Level 13+**: Expert words (10+ characters)

Ball speed increases by 5% per level, and time pressure decreases by 1% per level.

## 🌐 Deployment

### Deploy to Vercel (Frontend Only - for solo play)

1. Push to GitHub
2. Connect to Vercel
3. Deploy with default settings

```bash
npm run build
npm run start
```

### Deploy Frontend + Backend

#### Option 1: Separate Services

**Frontend (Vercel):**
1. Add environment variable: `NEXT_PUBLIC_SOCKET_URL=https://your-backend.com`
2. Deploy normally to Vercel

**Backend (Railway, Render, Heroku, etc.):**

Railway example:
```bash
# Push code with server.js
# Add environment variable: PORT=3001, CLIENT_URL=https://your-vercel-app.com
# Deploy
```

Render example:
```bash
# Create new Web Service from GitHub
# Build Command: npm install
# Start Command: node server.js
# Add environment variables in Dashboard
```

## 🔧 Configuration

Edit `constants/gameConfig.ts` to customize:

```typescript
initialBallSpeed: 150          // Pixels per second
ballAcceleration: 1.05         // Speed increase per level
ballTravelTime: 3000           // Time for ball to cross (ms)
```

Edit `constants/words.ts` to add or change word lists.

## 📊 Performance

- **60 FPS** ball animation
- **<100ms** network latency for multiplayer
- Responsive to all screen sizes
- Lightweight (~50KB bundle)

## 🐛 Troubleshooting

### Multiplayer not connecting
- Ensure server is running on port 3001
- Check that `NEXT_PUBLIC_SOCKET_URL` environment variable is set correctly
- Verify CORS settings in `server.js`

### Ball animation stuttering
- Clear browser cache
- Disable browser extensions
- Try a different browser

### Words too easy/hard
- Adjust `getDifficultyByLevel()` in `constants/gameConfig.ts`
- Modify word lists in `constants/words.ts`

## 🎨 Customization

### Change Colors
Edit Tailwind classes in component files:
- Replace `blue-600` with any Tailwind color
- Update Canvas colors in `GameCanvas.tsx` (hex values)

### Add Sound Effects
Install `use-sound` and add audio files to `public/sounds/`

### Custom Themes
Update `tailwind.config.ts` to create custom color palettes

## 📝 Future Enhancements

- [ ] Leaderboards with persistent scores
- [ ] Sound effects and background music
- [ ] Difficulty modes (casual, normal, hard)
- [ ] Replay system
- [ ] Mobile app (React Native)
- [ ] Tournaments/ladder system
- [ ] Power-ups and special abilities

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

---

Made with ❤️ for competitive typing enthusiasts!
