# 100 Pushups

A Progressive Web App (PWA) implementing the classic 100 Pushups training program - a 6-week progressive plan to build up to 100 consecutive pushups.

## Features

- **Progressive Training Program**: 6-week structured program with 3 workouts per week
- **5 Difficulty Levels**: Initial fitness test assigns appropriate starting level
- **Offline Support**: Full functionality without internet connection via service workers
- **Persistent Storage**: IndexedDB-based local storage for workout history
- **Rest Timer**: Adaptive rest periods (60/90/120s) with audio notifications
- **Progress Tracking**: Visual progress overview with week-by-week completion tracking
- **Week Repetition**: Option to repeat weeks if targets aren't met
- **Installable**: Can be installed on mobile devices as a standalone app
- **Polish Language**: Full UI in Polish language

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Preact](https://preactjs.com/)
- **Language**: TypeScript
- **Storage**: IndexedDB
- **Testing**: Bun test with Testing Library
- **Linting**: Biome
- **PWA**: Service Workers for offline support

## Prerequisites

- [Bun](https://bun.sh/) installed on your system

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd 100pushups

# Install dependencies
bun install
```

## Development

```bash
# Start development server with hot reload
bun run dev

# Run type checking
bun run typecheck

# Run linter
bun run lint

# Run formatter
bun run format

# Run code check (lint + format)
bun run check
```

The development server will start at `http://localhost:3000`.

## Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

## Building

```bash
# Build for production
bun run build
```

The built files will be in the `dist/` directory.

## Deployment

```bash
# Deploy to GitHub Pages
bun run deploy
```

The app is configured with GitHub Actions CI/CD pipeline that:
- Runs linting
- Runs tests
- Performs Lighthouse PWA audit
- Deploys to GitHub Pages on successful builds

## Project Structure

```
100pushups/
├── src/
│   ├── components/      # UI components
│   │   ├── HomeScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── data/           # Program data and logic
│   │   └── program.ts
│   ├── stores/         # IndexedDB storage
│   │   └── db.ts
│   ├── hooks/          # Custom hooks
│   │   ├── useStorage.ts
│   │   └── useRouter.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── styles.css      # Global styles
├── public/             # Static assets
├── build.ts            # Build script
├── serve.ts            # Development server
├── deploy.ts           # Deployment script
└── package.json
```

## How It Works

1. **Initial Test**: Users perform a fitness test (max pushups in one set) to determine their starting level (1-5)
2. **Training Schedule**: Each week has 3 workouts with 5 sets each
3. **Progressive Overload**: Rep targets increase progressively each week
4. **Final Set**: The 5th set of each workout is always "max reps"
5. **Rest Periods**: Adaptive rest between sets (60s/90s/120s based on difficulty)
6. **Week Repetition**: Option to repeat weeks with attempt tracking if targets aren't met
7. **Progress Display**: Compact format showing week (T: X/6), day (D: X/3), and attempt (P: X)

## Design Philosophy

The app features a modern, bold visual style designed to appeal to teenage users:
- Dark theme with high-contrast colors
- Energetic accent colors (electric blue, neon green, orange)
- Clean, minimal layout
- Compact screens optimized for mobile devices
- Satisfying completion animations with confetti effects

## License

Private project

## Contributing

This is a private project. For issues or feature requests, please use the GitHub issue tracker.
