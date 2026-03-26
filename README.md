<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?style=flat-square&logo=javascript" />
  <img src="https://img.shields.io/badge/Electron-34-47848f?style=flat-square&logo=electron" />
  <img src="https://img.shields.io/badge/Tauri-Ready-ffc131?style=flat-square&logo=tauri" />
  <img src="https://img.shields.io/badge/Platform-Multi-blueviolet?style=flat-square" />
</p>

# ChordSpark

> Guitar chord learning app with practice tracking, drill modes, games, and ear training

---

### Highlights

| Feature | Description |
|:--------|:------------|
| **Chord Library** | Full chord database with diagrams, finger positions, and audio playback |
| **Practice Sessions** | Timed practice with progress tracking and streak counting |
| **Guided Lessons** | Step-by-step lessons from beginner open chords to advanced barre chords |
| **Drill Mode** | Rapid-fire chord recognition and transition drills |
| **Games** | Interactive chord games to make practice fun |
| **Song Library** | Play along with songs using real chord progressions |
| **Dual Mode** | Side-by-side chord comparison for transitions |
| **Audio Playback** | Real guitar chord audio samples (WAV) |
| **Progress Tracking** | Track your practice time, accuracy, and improvement |

---

### Tech Stack

```
Language        Vanilla JavaScript (zero framework dependencies)
Desktop         Electron 34  |  Tauri (Rust backend)  |  Capacitor (mobile)
Audio           Web Audio API  +  WAV chord samples
Storage         localStorage for progress data
Server          Express.js dev server with hot reload
```

### Quick Start

```bash
npm install
npm start                      # Electron desktop app
# or
npm run tauri:dev              # Tauri desktop app
```

### Project Structure

```
chordspark/
  index.html                   # Main app entry
  js/
    app.js                     # App coordinator
    audio.js                   # Audio playback engine
    data.js                    # Chord database
    state.js                   # State management
    ui.js                      # UI rendering
    pages/
      practice.js              # Practice session mode
      guided.js                # Guided lessons
      songs.js                 # Song library
      games.js                 # Chord games
      dual.js                  # Dual chord comparison
      session.js               # Session tracking
      tools.js                 # Tuner, metronome, tools
  guitar_chords/               # WAV audio samples
  server/
    server.js                  # Express dev server
  styles.css                   # App styling
```

### Multi-Platform

| Platform | Command | Status |
|:---------|:--------|:-------|
| Electron (Windows/Mac/Linux) | `npm start` | Ready |
| Tauri (lightweight native) | `npm run tauri:dev` | Ready |
| Capacitor (iOS/Android) | `npx cap run` | Configured |
| Web browser | Open `index.html` | Works |

---

*Built by Scott Morley*
