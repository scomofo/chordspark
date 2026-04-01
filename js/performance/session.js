/* ===== ChordSpark Performance: Session Orchestrator ===== */

// Seek should also sync stems
function seekPerformance(sec) {
  PerformanceTransport.seek(sec);
  S.performCurrentSec = sec;
  if (typeof seekStems === "function") seekStems(sec);
  render();
}

// Improve stem preset handling
function applyPerformanceStemPreset(preset) {
  S.performPracticePreset = preset;
  if (typeof setStemMuted !== "function") return;
  if (typeof setStemVolume === "function") setStemVolume(0.8);

  switch (preset) {
    case "full_mix":
      setStemMuted("guitar", false);
      setStemMuted("vocals", false);
      setStemMuted("drums", false);
      setStemMuted("bass", false);
      setStemMuted("piano", false);
      setStemMuted("other", false);
      break;
    case "no_guitar":
      setStemMuted("guitar", true);
      break;
    case "guitar_quiet":
      if (typeof setStemVolume === "function") setStemVolume(0.3);
      break;
    case "guitar_solo":
      setStemMuted("vocals", true);
      setStemMuted("drums", true);
      setStemMuted("bass", true);
      setStemMuted("piano", true);
      setStemMuted("other", true);
      break;
  }
}
