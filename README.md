# ChordSpark

A guitar chord learning app with progress tracking, built with vanilla JavaScript. Practice chords, learn strum patterns, play songs, and track your progress — all in one app.

## Features

- **Practice Mode** — Timed sessions with chord diagrams, finger placement, and multiple voicings
- **Chord Drill** — Quick-fire chord switching practice with built-in and custom drill sets
- **Daily Challenges** — Speed switch, iron grip, marathon, clean strum, and blind switch
- **Chord Quiz** — Test your chord knowledge with multiple choice questions
- **Ear Training** — Identify chords by listening with AI-powered chord detection
- **Strum Patterns** — Learn 6 patterns across 3 difficulty levels with animated guides
- **Song Practice** — Play along with real songs using chord progressions and metronome
- **Rhythm Game** — Hit the beat timing game for rhythm accuracy training
- **Progression Builder** — Create and play custom chord progressions
- **Guitar Tuner** — Built-in chromatic tuner using your microphone
- **Statistics** — Track sessions, streaks, XP, practice calendar, and chord mastery
- **Learning Guide** — Step-by-step lessons for beginners through advanced players
- **Import Chord Sheets** — Paste chord sheets and parse them into playable songs
- **Keyboard Shortcuts** — Full keyboard control (press `?` for help)
- **Dark Mode** — Toggle between light and dark themes
- **Badges** — Earn achievements as you progress

## Tech Stack

- **Frontend:** Vanilla JavaScript (no frameworks), HTML5, CSS3
- **Desktop:** Electron or Tauri
- **Mobile:** Capacitor (iOS/Android)
- **Audio:** Web Audio API for sound effects, metronome, tuner, and chord detection
- **Storage:** localStorage for progress persistence

## File Structure

```
chordspark/
  index.html          # Single-page app entry point
  styles.css          # All styles with CSS custom properties for theming
  main.js             # Electron main process
  preload.js          # Electron preload script
  icon.png            # App icon
  js/
    data.js           # Constants, chord data, songs, badges, voicings
    state.js          # State management and localStorage persistence
    audio.js          # Web Audio API: sounds, metronome, tuner, chord detection
    ui.js             # SVG chord diagrams, progress rings, strum visuals
    pages.js          # All page/tab rendering functions
    app.js            # Action dispatcher, render loop, keyboard shortcuts
  server/             # Community song server (optional)
    server.js         # Express API for community song submissions
    db.js             # SQLite database setup and seeding
  src-tauri/          # Tauri desktop build (alternative to Electron)
  capacitor.config.ts # Capacitor mobile build config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Run with Electron

```bash
npm start
```

### Build Electron Installer

```bash
npm run build          # Windows (NSIS)
npm run build:mac      # macOS (DMG)
npm run build:portable # Windows portable
```

## Tauri Desktop Build

Tauri produces much smaller installers (~5-8MB vs ~65MB for Electron).

### Prerequisites

- [Rust](https://rustup.rs/) toolchain
- Platform-specific dependencies (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

### Build

```bash
npm run tauri:dev      # Development with hot reload
npm run tauri:build    # Production installer
```

## Capacitor Mobile Build

### Prerequisites

- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Setup

```bash
npm run cap:sync       # Sync web assets to native projects
npm run cap:android    # Open Android project in Android Studio
npm run cap:ios        # Open iOS project in Xcode
```

## Community Server (Optional)

The community server allows users to submit and vote on songs.

```bash
cd server
npm install
node server.js
```

Runs on `http://localhost:3456`. The app works fully offline without it.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause/Resume |
| `Left/Right` | BPM -/+5 |
| `Up/Down` | Navigate levels |
| `Enter` | Confirm (drill switch) |
| `Escape` | Back / Close overlay |
| `M` | Toggle metronome |
| `Shift+S` | Toggle sound |
| `D` | Toggle dark mode |
| `1-9, 0` | Quick tab switch |
| `?` | Show shortcut help |

## License

MIT
