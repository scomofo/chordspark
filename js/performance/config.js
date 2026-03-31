(function(){
  var PERFORMANCE_CONFIG = {
    attackClusterMs: 40,
    recentAttackWindowMs: 220,
    stemResyncThresholdMs: 120,
    stemResyncIntervalMs: 1000,
    defaultPhraseEventCount: 8,
    defaultLoopScoringMode: "practice",
    countInBeats: 4,
    countInAccentBeat: 1,
    highway: {
      scrollSpeed: 180,
      lookaheadSec: 3.0,
      hitLineTopPx: 340
    },
    ui: {
      hitBadgeMs: 800,
      debugDefault: false
    }
  };

  window.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG;
})();
