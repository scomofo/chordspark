// ═══════════════════════════════════════════════════════════════════
// ChordSpark Storage — localStorage persistence
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY = "chordspark-progress";

const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  freezes: 1,
  lastPractice: null,
  learnedChords: [],
  completedSessions: 0,
  completedSongs: [],
  badges: [],
  chordMastery: {},
  currentLevel: 1,
  createdAt: new Date().toISOString(),
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge with defaults to handle new fields added in updates
      return { ...DEFAULT_PROGRESS, ...saved };
    }
  } catch (e) {
    console.warn("ChordSpark: Could not load progress", e);
  }
  return { ...DEFAULT_PROGRESS };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("ChordSpark: Could not save progress", e);
  }
}

function resetProgress() {
  const fresh = { ...DEFAULT_PROGRESS, createdAt: new Date().toISOString() };
  saveProgress(fresh);
  return fresh;
}

// ADHD-safe streak update: streaks pause, never punish
function updateStreak(progress) {
  const today = new Date().toDateString();
  if (progress.lastPractice === today) return progress; // Already practiced today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let newStreak;

  if (progress.lastPractice === yesterday) {
    // Consecutive day — increment
    newStreak = progress.streak + 1;
  } else if (progress.lastPractice) {
    // Missed days — check for freeze, then pause (never reset to 0)
    const daysSince = Math.floor((Date.now() - new Date(progress.lastPractice).getTime()) / 86400000);
    if (daysSince <= 2 && progress.freezes > 0) {
      // Auto-apply freeze
      newStreak = progress.streak + 1;
      progress.freezes = Math.max(0, progress.freezes - 1);
    } else {
      // Streak paused, but we keep the number (dims, doesn't extinguish)
      newStreak = Math.max(1, Math.floor(progress.streak * 0.8)); // Gentle decay, never zero
      // Check for Comeback Kid badge (7+ day absence)
      if (daysSince >= 7 && !progress.badges.includes("comeback-kid")) {
        progress.badges = [...progress.badges, "comeback-kid"];
      }
    }
  } else {
    newStreak = 1; // First ever session
  }

  progress.streak = newStreak;
  progress.bestStreak = Math.max(progress.bestStreak || 0, newStreak);
  progress.lastPractice = today;

  // Weekly freeze refill
  const lastDate = new Date(progress.lastPractice);
  if (lastDate.getDay() === 1) { // Monday
    progress.freezes = Math.min(progress.freezes + 1, 3);
  }

  return progress;
}
