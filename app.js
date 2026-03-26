// ═══════════════════════════════════════════════════════════════════
// ChordSpark App — Main Controller
// ═══════════════════════════════════════════════════════════════════

let progress;
let currentView = "home";
let sessionState = null;
let selectedLevelIdx = null;
let toastTimeout = null;
let sessionInterval = null;
let chordRotateInterval = null;

// ─── INIT ─────────────────────────────────────────────────────────
function init() {
  progress = loadProgress();
  renderApp();
}

// ─── NAVIGATION ───────────────────────────────────────────────────
function navigate(view, data) {
  if (sessionState) return; // Can't navigate during session
  currentView = view;
  if (data !== undefined) selectedLevelIdx = data;
  renderApp();
  document.getElementById("app").scrollTop = 0;
}

// ─── TOAST ────────────────────────────────────────────────────────
function showToast(msg, color = "#22c55e") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = color + "22";
  el.style.borderColor = color + "55";
  el.style.color = color;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("show"), 2600);
}

// ─── ACTIONS ──────────────────────────────────────────────────────
function learnChord(chordId) {
  if (progress.learnedChords.includes(chordId)) return;
  const chord = CHORDS[chordId];
  progress.learnedChords.push(chordId);
  progress.xp += XP_TABLE.chord;
  progress.currentLevel = Math.max(progress.currentLevel, chord.level);

  // Auto-unlock next level if current is complete
  const currentLvl = LEVELS[progress.currentLevel - 1];
  if (currentLvl && currentLvl.chords.every(c => progress.learnedChords.includes(c))) {
    if (progress.currentLevel < LEVELS.length) {
      progress.currentLevel = progress.currentLevel + 1;
    }
  }

  checkBadges();
  saveProgress(progress);
  showToast(`+${XP_TABLE.chord} XP — Learned ${chord.name}!`, chord.color);
  renderApp();
}

function checkBadges() {
  for (const badge of BADGES) {
    if (!progress.badges.includes(badge.id) && badge.test(progress)) {
      progress.badges.push(badge.id);
      setTimeout(() => showToast(`🏅 Badge unlocked: ${badge.name}!`, "#f59e0b"), 800);
    }
  }
}

// ─── SESSION TIMER ────────────────────────────────────────────────
function startSession() {
  const allChords = [];
  for (let i = 0; i < progress.currentLevel && i < LEVELS.length; i++) {
    LEVELS[i].chords.forEach(c => { if (!allChords.includes(c)) allChords.push(c); });
  }

  sessionState = {
    phase: 0,
    timeLeft: SESSION_PHASES[0].duration,
    running: true,
    chords: allChords,
    displayChord: 0,
  };

  currentView = "session";
  renderApp();
  startSessionTimer();
}

function startSessionTimer() {
  clearInterval(sessionInterval);
  clearInterval(chordRotateInterval);

  sessionInterval = setInterval(() => {
    if (!sessionState || !sessionState.running) return;

    sessionState.timeLeft--;

    if (sessionState.timeLeft <= 0) {
      if (sessionState.phase < SESSION_PHASES.length - 1) {
        sessionState.phase++;
        sessionState.timeLeft = SESSION_PHASES[sessionState.phase].duration;
      } else {
        completeSession();
        return;
      }
    }
    renderSessionTimer();
  }, 1000);

  chordRotateInterval = setInterval(() => {
    if (!sessionState) return;
    if (sessionState.phase >= 2) { // New Move and Song Slice phases
      sessionState.displayChord = (sessionState.displayChord + 1) % sessionState.chords.length;
      renderSessionChord();
    }
  }, 4000);
}

function toggleSessionPause() {
  if (!sessionState) return;
  sessionState.running = !sessionState.running;
  renderApp();
}

function exitSession() {
  clearInterval(sessionInterval);
  clearInterval(chordRotateInterval);
  // Award partial XP (ADHD-safe: bad days still count)
  progress.xp += Math.round(XP_TABLE.session * 0.5);
  progress = updateStreak(progress);
  progress.completedSessions++;
  checkBadges();
  saveProgress(progress);
  sessionState = null;
  currentView = "home";
  showToast("Session ended — partial XP awarded!", "#f59e0b");
  renderApp();
}

function completeSession() {
  clearInterval(sessionInterval);
  clearInterval(chordRotateInterval);

  progress = updateStreak(progress);
  let bonusXp = 0;
  if (progress.streak === 3) bonusXp = XP_TABLE.streak3;
  if (progress.streak === 7) bonusXp = XP_TABLE.streak7;
  if (progress.streak > 0 && progress.streak % 7 === 0) bonusXp = XP_TABLE.streak7;

  progress.xp += XP_TABLE.session + bonusXp;
  progress.completedSessions++;

  // Refill weekly freeze
  if (progress.streak > 0 && progress.streak % 7 === 0) {
    progress.freezes = Math.min((progress.freezes || 0) + 1, 3);
  }

  checkBadges();
  saveProgress(progress);
  sessionState = null;
  currentView = "home";

  const bonusMsg = bonusXp > 0 ? ` (+${bonusXp} streak bonus!)` : "";
  showToast(`🎉 Session complete! +${XP_TABLE.session + bonusXp} XP${bonusMsg}`, "#f59e0b");
  renderApp();
}

function skipToSongPhase() {
  if (!sessionState) return;
  // Skip costs bonus XP but respects autonomy
  sessionState.phase = 3; // Song Slice
  sessionState.timeLeft = SESSION_PHASES[3].duration;
  renderApp();
}

// ─── XP HELPERS ───────────────────────────────────────────────────
function getXpLevel() {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (progress.xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

function getXpProgress() {
  const lvl = getXpLevel();
  const curr = LEVEL_THRESHOLDS[lvl];
  const next = LEVEL_THRESHOLDS[Math.min(lvl + 1, LEVEL_THRESHOLDS.length - 1)];
  if (next === curr) return 100;
  return ((progress.xp - curr) / (next - curr)) * 100;
}

// ─── RENDER: APP SHELL ────────────────────────────────────────────
function renderApp() {
  const app = document.getElementById("app");

  if (currentView === "session" && sessionState) {
    app.innerHTML = renderSessionView();
    document.getElementById("nav").style.display = "none";
    return;
  }

  document.getElementById("nav").style.display = "flex";

  // Update nav active states
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });

  let html = "";
  switch (currentView) {
    case "home":    html = renderHomeView(); break;
    case "chords":  html = renderChordsView(); break;
    case "songs":   html = renderSongsView(); break;
    case "practice":html = renderPracticeView(); break;
    case "badges":  html = renderBadgesView(); break;
    case "level":   html = renderLevelView(); break;
    default:        html = renderHomeView();
  }
  app.innerHTML = html;
}

// ─── RENDER: SESSION ──────────────────────────────────────────────
function renderSessionView() {
  const s = sessionState;
  const p = SESSION_PHASES[s.phase];
  const total = SESSION_PHASES.reduce((a, b) => a + b.duration, 0);
  const elapsed = SESSION_PHASES.slice(0, s.phase).reduce((a, b) => a + b.duration, 0) + (p.duration - s.timeLeft);
  const mm = Math.floor(s.timeLeft / 60);
  const ss = String(s.timeLeft % 60).padStart(2, "0");

  const phaseBar = SESSION_PHASES.map((sp, i) => {
    let pct;
    if (i < s.phase) pct = 100;
    else if (i === s.phase) pct = ((p.duration - s.timeLeft) / p.duration) * 100;
    else pct = 0;
    return `<div class="phase-seg" style="flex:${sp.duration};background:linear-gradient(90deg, ${sp.color} ${pct}%, #1e1e2e ${pct}%)"></div>`;
  }).join("");

  const chordKey = s.chords[s.displayChord % s.chords.length];
  const chordDiagram = renderChordDiagram(chordKey, { size: 180, glow: true });

  const chordBtns = s.chords.map((ck, i) => {
    const ch = CHORDS[ck];
    const active = i === s.displayChord % s.chords.length;
    return `<button class="chord-pill ${active ? "active" : ""}" style="border-color:${active ? ch.color : ch.color + "44"};color:${ch.color};background:${active ? ch.color + "22" : "transparent"}"
      onclick="sessionState.displayChord=${i};renderSessionChord()">${ch.name}</button>`;
  }).join("");

  const canSkip = s.phase < 3;

  return `
    <div class="session-view">
      <div class="phase-bar">${phaseBar}</div>
      <div class="session-header">
        <div class="phase-icon">${p.icon}</div>
        <div class="phase-name" style="color:${p.color}">${p.name}</div>
        <div class="session-timer">${mm}:${ss}</div>
        <div class="phase-desc">${p.desc}</div>
      </div>
      <div class="session-progress-bar">
        <div class="session-progress-fill" style="width:${(elapsed/total)*100}%;background:linear-gradient(90deg, #f59e0b, ${p.color})"></div>
      </div>
      <div class="session-chord-area" id="session-chord-area">
        <div class="session-chord-diagram" id="session-chord">${chordDiagram}</div>
        <div class="session-chord-pills" id="session-pills">${chordBtns}</div>
      </div>
      <div class="session-controls">
        ${canSkip ? `<button class="btn-session-secondary" onclick="skipToSongPhase()">⏭ Skip to Song</button>` : ""}
        <button class="btn-session-secondary" onclick="toggleSessionPause()">${s.running ? "⏸ Pause" : "▶ Resume"}</button>
        <button class="btn-session-exit" onclick="exitSession()">✕ End</button>
      </div>
    </div>`;
}

function renderSessionTimer() {
  const s = sessionState;
  if (!s) return;
  const p = SESSION_PHASES[s.phase];
  const mm = Math.floor(s.timeLeft / 60);
  const ss = String(s.timeLeft % 60).padStart(2, "0");

  const timerEl = document.querySelector(".session-timer");
  if (timerEl) timerEl.textContent = `${mm}:${ss}`;

  const nameEl = document.querySelector(".phase-name");
  if (nameEl) { nameEl.textContent = p.name; nameEl.style.color = p.color; }

  const iconEl = document.querySelector(".phase-icon");
  if (iconEl) iconEl.textContent = p.icon;

  const descEl = document.querySelector(".phase-desc");
  if (descEl) descEl.textContent = p.desc;

  // Update phase bar
  const segs = document.querySelectorAll(".phase-seg");
  SESSION_PHASES.forEach((sp, i) => {
    let pct;
    if (i < s.phase) pct = 100;
    else if (i === s.phase) pct = ((p.duration - s.timeLeft) / p.duration) * 100;
    else pct = 0;
    if (segs[i]) segs[i].style.background = `linear-gradient(90deg, ${sp.color} ${pct}%, #1e1e2e ${pct}%)`;
  });

  // Overall progress
  const total = SESSION_PHASES.reduce((a, b) => a + b.duration, 0);
  const elapsed = SESSION_PHASES.slice(0, s.phase).reduce((a, b) => a + b.duration, 0) + (p.duration - s.timeLeft);
  const fill = document.querySelector(".session-progress-fill");
  if (fill) {
    fill.style.width = `${(elapsed/total)*100}%`;
    fill.style.background = `linear-gradient(90deg, #f59e0b, ${p.color})`;
  }
}

function renderSessionChord() {
  const s = sessionState;
  if (!s) return;
  const chordKey = s.chords[s.displayChord % s.chords.length];
  const el = document.getElementById("session-chord");
  if (el) el.innerHTML = renderChordDiagram(chordKey, { size: 180, glow: true });

  // Update pills
  const pills = document.getElementById("session-pills");
  if (pills) {
    pills.querySelectorAll(".chord-pill").forEach((btn, i) => {
      const ck = s.chords[i];
      const ch = CHORDS[ck];
      const active = i === s.displayChord % s.chords.length;
      btn.classList.toggle("active", active);
      btn.style.borderColor = active ? ch.color : ch.color + "44";
      btn.style.background = active ? ch.color + "22" : "transparent";
    });
  }
}

// ─── RENDER: HOME ─────────────────────────────────────────────────
function renderHomeView() {
  const xpLvl = getXpLevel();
  const xpPct = getXpProgress();
  const xpNext = LEVEL_THRESHOLDS[Math.min(xpLvl + 1, LEVEL_THRESHOLDS.length - 1)];
  const playable = countPlayableSongs(progress);
  const today = new Date().toDateString();
  const practicedToday = progress.lastPractice === today;

  const levelCards = LEVELS.map((lvl, i) => {
    const isActive = lvl.num === progress.currentLevel;
    const isDone = lvl.chords.every(c => progress.learnedChords.includes(c));
    const isLocked = lvl.num > progress.currentLevel;
    const dots = lvl.chords.map(ck => renderChordDot(ck, progress.learnedChords.includes(ck))).join("");

    return `
      <button class="level-card ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}"
        onclick="${isLocked ? "" : `navigate('level', ${i})`}" ${isLocked ? "disabled" : ""}>
        <div class="level-icon">${isDone ? "✅" : isLocked ? "🔒" : lvl.badgeIcon}</div>
        <div class="level-info">
          <div class="level-title ${isActive ? "highlight" : ""}" ${isActive ? `style="color:#f59e0b"` : isDone ? `style="color:#22c55e"` : ""}>
            Level ${lvl.num}: ${lvl.title}
          </div>
          <div class="level-sub">${lvl.subtitle} · ${lvl.chords.length} chord${lvl.chords.length > 1 ? "s" : ""}</div>
        </div>
        <div class="level-dots">${dots}</div>
      </button>`;
  }).join("");

  // Welcome back message (ADHD-friendly)
  let welcomeMsg = "Ready to play?";
  if (practicedToday) welcomeMsg = "Great work today! Want another round?";
  else if (progress.completedSessions === 0) welcomeMsg = "Let's make some noise.";
  else if (progress.streak >= 7) welcomeMsg = `${progress.streak}-day streak! Keep it going.`;

  return `
    <div class="view-home">
      <div class="home-header">
        <div>
          <div class="brand">ChordSpark</div>
          <div class="welcome">${welcomeMsg}</div>
        </div>
        <div class="streak-badge ${progress.streak > 0 ? "has-streak" : ""}">
          <span class="streak-icon">${progress.streak > 0 ? "🔥" : "💤"}</span>
          <span class="streak-num">${progress.streak}</span>
        </div>
      </div>

      <div class="xp-card">
        <div class="xp-row">
          <span class="xp-label">Player Level <strong>${xpLvl + 1}</strong></span>
          <span class="xp-numbers">${progress.xp.toLocaleString()} / ${xpNext.toLocaleString()} XP</span>
        </div>
        <div class="xp-bar"><div class="xp-fill" style="width:${Math.min(xpPct, 100)}%"></div></div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value" style="color:#3b82f6">${progress.learnedChords.length}</div>
          <div class="stat-label">Chords / 20</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:#22c55e">${playable}</div>
          <div class="stat-label">Songs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:#a855f7">${progress.completedSessions}</div>
          <div class="stat-label">Sessions</div>
        </div>
      </div>

      <button class="btn-start" onclick="startSession()">
        <span class="btn-start-icon">⚡</span>
        <span>Start Today's Session</span>
      </button>

      <div class="section-label">Your Journey</div>
      <div class="level-list">${levelCards}</div>

      <div class="reset-area">
        <button class="btn-reset" onclick="confirmReset()">Reset Progress</button>
      </div>
    </div>`;
}

function confirmReset() {
  if (confirm("Reset all progress? Your XP, chords, and badges will be cleared. This cannot be undone.")) {
    progress = resetProgress();
    showToast("Progress reset.", "#ef4444");
    renderApp();
  }
}

// ─── RENDER: CHORDS ───────────────────────────────────────────────
function renderChordsView() {
  const pct = Math.round((progress.learnedChords.length / 20) * 100);

  const sections = LEVELS.map(lvl => {
    const cards = lvl.chords.map(ck => {
      const learned = progress.learnedChords.includes(ck);
      const locked = lvl.num > progress.currentLevel;
      const diagram = renderChordDiagram(ck, { size: 120, glow: learned, dimmed: locked });

      let action = "";
      if (locked) {
        action = `<div class="chord-card-lock">🔒</div>`;
      } else if (!learned) {
        action = `<button class="btn-learn" style="background:${CHORDS[ck].color}33;color:${CHORDS[ck].color}" onclick="learnChord('${ck}')">Learn</button>`;
      } else {
        action = `<div class="chord-learned" style="color:${CHORDS[ck].color}">✓ Learned</div>`;
      }

      return `<div class="chord-card ${locked ? "locked" : ""}">${diagram}${action}</div>`;
    }).join("");

    return `
      <div class="chord-section">
        <div class="chord-section-header">${lvl.badgeIcon} Level ${lvl.num}: ${lvl.title}</div>
        <div class="chord-grid">${cards}</div>
      </div>`;
  }).join("");

  return `
    <div class="view-chords">
      <div class="view-header">
        <div class="view-label" style="color:#f59e0b">CHORD COLLECTION</div>
        <div class="view-title">${progress.learnedChords.length} / 20 Chords</div>
      </div>
      <div class="progress-thin"><div class="progress-thin-fill" style="width:${pct}%"></div></div>
      ${sections}
    </div>`;
}

// ─── RENDER: SONGS ────────────────────────────────────────────────
function renderSongsView() {
  const playable = countPlayableSongs(progress);

  const sections = LEVELS.map(lvl => {
    const levelPlayable = lvl.chords.every(c => progress.learnedChords.includes(c));
    const missing = lvl.chords.filter(c => !progress.learnedChords.includes(c)).map(c => CHORDS[c].name);

    const songs = lvl.songUnlocks.map(s => `
      <div class="song-row ${levelPlayable ? "playable" : "locked"}">
        <span class="song-icon">${levelPlayable ? "🎵" : "🔒"}</span>
        <div class="song-info">
          <div class="song-name">${s}</div>
          <div class="song-meta">${levelPlayable ? "Ready to play!" : `Needs: ${missing.join(", ")}`}</div>
        </div>
        ${levelPlayable ? '<span class="song-play">PLAY →</span>' : ""}
      </div>`).join("");

    return `
      <div class="song-section">
        <div class="song-section-header ${levelPlayable ? "unlocked" : ""}">LEVEL ${lvl.num}: ${lvl.title.toUpperCase()}</div>
        ${songs}
      </div>`;
  }).join("");

  return `
    <div class="view-songs">
      <div class="view-header">
        <div class="view-label" style="color:#22c55e">SONG LIBRARY</div>
        <div class="view-title">${playable} Songs Unlocked</div>
      </div>
      ${sections}
    </div>`;
}

// ─── RENDER: PRACTICE ─────────────────────────────────────────────
function renderPracticeView() {
  const modes = PRACTICE_MODES.map(m => `
    <button class="practice-mode-card" onclick="startSession()">
      <div class="practice-icon">${m.icon}</div>
      <div class="practice-info">
        <div class="practice-name">${m.name}</div>
        <div class="practice-desc">${m.desc}</div>
      </div>
    </button>`).join("");

  const pairs = ANCHOR_PAIRS.map(([a, b]) => {
    const canPlay = progress.learnedChords.includes(a) && progress.learnedChords.includes(b);
    return `
      <button class="transition-card ${canPlay ? "" : "locked"}" onclick="${canPlay ? "startSession()" : ""}" ${canPlay ? "" : "disabled"}>
        <div class="transition-pair">
          <span style="color:${CHORDS[a].color};font-weight:800">${CHORDS[a].name}</span>
          <span class="transition-arrow">⇄</span>
          <span style="color:${CHORDS[b].color};font-weight:800">${CHORDS[b].name}</span>
        </div>
        <div class="transition-label">Anchor pair</div>
      </button>`;
  }).join("");

  return `
    <div class="view-practice">
      <div class="view-header">
        <div class="view-label" style="color:#a855f7">PRACTICE MODES</div>
        <div class="view-title">Anti-Boredom System</div>
        <div class="view-sub">Variety within structure. Never the same format twice in a row.</div>
      </div>
      <div class="practice-modes">${modes}</div>
      <div class="section-label" style="color:#f59e0b">Quick Transitions</div>
      <div class="transition-grid">${pairs}</div>
    </div>`;
}

// ─── RENDER: BADGES ───────────────────────────────────────────────
function renderBadgesView() {
  const earned = progress.badges.length;

  const cards = BADGES.map(b => {
    const done = b.test(progress);
    return `
      <div class="badge-card ${done ? "earned" : ""}">
        <div class="badge-icon ${done ? "" : "locked"}">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-trigger">${b.trigger}</div>
      </div>`;
  }).join("");

  return `
    <div class="view-badges">
      <div class="view-header">
        <div class="view-label" style="color:#eab308">ACHIEVEMENTS</div>
        <div class="view-title">${earned} Badges Earned</div>
      </div>
      <div class="badge-grid">${cards}</div>
    </div>`;
}

// ─── RENDER: LEVEL DETAIL ─────────────────────────────────────────
function renderLevelView() {
  const lvl = LEVELS[selectedLevelIdx];
  if (!lvl) { navigate("home"); return ""; }

  const chordCards = lvl.chords.map(ck => {
    const learned = progress.learnedChords.includes(ck);
    const diagram = renderChordDiagram(ck, { size: 140, glow: learned });
    const ch = CHORDS[ck];

    return `
      <div class="level-chord-card" style="border-color:${learned ? ch.color + "66" : "#2a2a3a"}">
        ${diagram}
        <div class="level-chord-meta">
          <div class="level-chord-fullname">${ch.fullName}</div>
          <div class="level-chord-fingers">${ch.fingers} finger${ch.fingers > 1 ? "s" : ""}</div>
        </div>
        ${!learned
          ? `<button class="btn-learn-lg" style="background:${ch.color}" onclick="learnChord('${ck}')">Mark as Learned</button>`
          : `<div class="chord-learned-lg" style="color:${ch.color}">✓ Learned</div>`}
      </div>`;
  }).join("");

  const transitions = (lvl.transitions || []).map(t => {
    const stars = "★".repeat(t.difficulty) + "☆".repeat(3 - t.difficulty);
    return `
      <div class="transition-info">
        <div class="transition-names">
          <span style="color:${CHORDS[t.from].color}">${CHORDS[t.from].name}</span>
          <span class="transition-arrow-sm">→</span>
          <span style="color:${CHORDS[t.to].color}">${CHORDS[t.to].name}</span>
          <span class="transition-stars">${stars}</span>
        </div>
        <div class="transition-anchor">${t.anchor}</div>
      </div>`;
  }).join("");

  const songs = lvl.songUnlocks.map(s => {
    const playable = lvl.chords.every(c => progress.learnedChords.includes(c));
    return `
      <div class="song-row ${playable ? "playable" : "locked"}">
        <span class="song-icon">${playable ? "🎵" : "🔒"}</span>
        <span class="song-name">${s}</span>
      </div>`;
  }).join("");

  const canStart = lvl.num <= progress.currentLevel;

  return `
    <div class="view-level">
      <button class="btn-back" onclick="navigate('home')">← Back</button>
      <div class="level-detail-header">
        <div class="level-detail-icon">${lvl.badgeIcon}</div>
        <div>
          <div class="view-label" style="color:#f59e0b">LEVEL ${lvl.num}</div>
          <div class="level-detail-title">${lvl.title}</div>
        </div>
      </div>
      <div class="level-detail-sub">${lvl.subtitle} · Sessions ${lvl.sessions}</div>
      <p class="level-detail-desc">${lvl.desc}</p>

      ${lvl.anchorTip ? `<div class="anchor-tip"><span class="anchor-tip-label">💡 Anchor Tip</span>${lvl.anchorTip}</div>` : ""}

      <div class="section-label" style="color:#f59e0b">Chords</div>
      <div class="level-chord-grid">${chordCards}</div>

      ${transitions ? `<div class="section-label" style="color:#8b5cf6">Transitions</div><div class="transitions-list">${transitions}</div>` : ""}

      <div class="section-label" style="color:#22c55e">Song Unlocks</div>
      <div class="level-songs">${songs}</div>

      ${canStart ? `<button class="btn-start level-start" onclick="startSession()">⚡ Start Level ${lvl.num} Session</button>` : ""}
    </div>`;
}

// ─── BOOT ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
