# AGENTS.md

## Project Overview
100 Pushups - PWA implementing the 6-week pushup training program. Polish language only.

## Tech Stack
- Runtime: Bun
- Language: TypeScript (strict mode)
- UI: Preact with hooks (React-compatible, ~3KB)
- Storage: IndexedDB (local only)
- PWA: Service worker for offline support

## Commands
- `bun run dev` - Start dev server (port 3000)
- `bun run build` - Production build to dist/
- `bun run test` - Run tests
- `bun run typecheck` - TypeScript check
- `bun run check` - Lint + format (Biome)

## Project Structure
- `src/` - TypeScript source files
  - `components/` - Preact components
  - `hooks/` - Custom hooks
  - `stores/` - State management
  - `data/` - Program data (weeks, sets, reps)
- `public/` - Static PWA assets
- `plans/prd.json` - Feature requirements

## Coding Guidelines
- All UI text must be in Polish
- Use Biome for formatting (tabs, double quotes)
- Use Preact hooks for state (useState, useEffect, useContext)
- Use functional components only (no class components)
- Store data in IndexedDB via a custom hook (useStorage)
- Keep components small and focused

## PRD Integration
Requirements are in `plans/prd.json`. Each has:
- `steps_to_verify` - acceptance criteria
- `passes: false` - set to true when verified
