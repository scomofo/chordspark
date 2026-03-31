/* ===== ChordSpark Performance: Session Orchestrator ===== */

var _performRAF = null;
var _performStopping = false;

function startPerformanceCountIn(chart, speed, onDone) {
  var bpm = chart.bpm || 90;
  var beatMs = (60000 / bpm) / (speed || 1);
  var beats = (typeof PERFORMANCE_CONFIG !== "undefined") ? PERFORMANCE_CONFIG.countInBeats : 4;
  S.performCountdownActive = true;
  S.performCountdownBeats = beats;
  render();

  function tick() {
    S.performCountdownBeats--;
    // Play metronome click if sound is on
    if (S.soundOn && typeof metroClick === "function") {
      metroClick(S.performCountdownBeats === 0);
    }
    if (S.performCountdownBeats <= 0) {
      S.performCountdownActive = false;
      render();
      onDone();
    } else {
      render();
      setTimeout(tick, beatMs);
    }
  }

  setTimeout(tick, beatMs);
}

function startPerformance(chartId, opts) {
  opts = opts || {};
  _performStopping = false;
  stopAllTimers();

  loadPerformanceChart(chartId).then(function(chart) {
    S.performChart = chart;
    S.performChartId = chartId;
    S.performPlaying = true;
    S.performPaused = false;
    S.performCurrentSec = 0;
    S.performStartSec = 0;
    S.performScore = 0;
    S.performCombo = 0;
    S.performMaxCombo = 0;
    S.performAccuracy = 0;
    S.performPhraseIdx = 0;
    S.performResults = null;
    S.performStarRating = 0;
    S.performLoop = null;
    S.performLastHitLabel = "";
    S.performLastHitTime = 0;
    S.performPhraseStats = createEmptyPhraseStats(chart);

    if (opts.mode) S.performMode = opts.mode;
    if (opts.difficulty) S.performDifficulty = opts.difficulty;
    if (opts.speed) S.performSpeed = opts.speed;
    if (opts.preset) S.performPracticePreset = opts.preset;

    S.performInputSource = S.performMode;

    // Apply difficulty profile to state windows
    applyPerformanceDifficultyToState(S.performDifficulty);
    // Apply config-driven runtime values
    if (typeof PERFORMANCE_CONFIG !== "undefined") {
      S.performScrollSpeed = PERFORMANCE_CONFIG.highway.scrollSpeed;
      S.performHighwayLookaheadSec = PERFORMANCE_CONFIG.highway.lookaheadSec;
    }

    PerformanceInput.start(S.performMode);
    applyPerformanceStemPreset(S.performPracticePreset);

    S.screen = SCR.PERFORM;

    if (S.performCountIn) {
      startPerformanceCountIn(chart, S.performSpeed, function() {
        PerformanceTransport.start(0, S.performSpeed);
        render();
        _performRAF = requestAnimationFrame(updatePerformanceFrame);
      });
    } else {
      PerformanceTransport.start(0, S.performSpeed);
      render();
      _performRAF = requestAnimationFrame(updatePerformanceFrame);
    }
  }).catch(function(err) {
    console.error("ChordSpark: Failed to start performance:", err);
    S.screen = SCR.HOME;
    S.tab = TAB.SONGS;
    render();
  });
}

function stopPerformance() {
  _performStopping = true;
  if (_performRAF) { cancelAnimationFrame(_performRAF); _performRAF = null; }
  try { PerformanceTransport.stop(); } catch(e) {}
  try { PerformanceInput.stop(); } catch(e) {}
  S.performPlaying = false;
  S.performPaused = false;
}

function resetPerformanceEvents(chart, rangeStartSec, rangeEndSec) {
  if (!chart || !Array.isArray(chart.events)) return;
  var useRange = typeof rangeStartSec === "number" && typeof rangeEndSec === "number";
  for (var i = 0; i < chart.events.length; i++) {
    var evt = chart.events[i];
    if (useRange && (evt.t < rangeStartSec || evt.t >= rangeEndSec)) continue;
    evt._hit = false;
    evt._miss = false;
    evt._scored = false;
    evt._result = null;
    evt._score = 0;
  }
}

function pausePerformance() {
  PerformanceTransport.pause();
  S.performPaused = true;
  S.performPlaying = false;
  if (_performRAF) { cancelAnimationFrame(_performRAF); _performRAF = null; }
  render();
}

function resumePerformance() {
  PerformanceTransport.resume();
  S.performPaused = false;
  S.performPlaying = true;
  _performRAF = requestAnimationFrame(updatePerformanceFrame);
  render();
}

function seekPerformance(sec) {
  PerformanceTransport.seek(sec);
  S.performCurrentSec = sec;
  render();
}

function setPerformanceLoop(loopObj) {
  S.performLoop = loopObj;
  render();
}

function clearPerformanceLoop() {
  S.performLoop = null;
  render();
}

function updatePerformanceFrame() {
  if (_performStopping || !S.performPlaying || S.performPaused) return;

  var nowSec = PerformanceTransport.now();
  S.performCurrentSec = nowSec;
  S.performPhraseIdx = getPerformancePhraseIndexForTime(S.performChart, nowSec);

  maybeScorePendingEvents(nowSec);

  // Loop enforcement
  if (S.performLoop && nowSec >= S.performLoop.endSec) {
    PerformanceTransport.seek(S.performLoop.startSec);
    resetPerformanceEvents(S.performChart, S.performLoop.startSec, S.performLoop.endSec);
    render();
    _performRAF = requestAnimationFrame(updatePerformanceFrame);
    return;
  }

  // Check if past end of chart
  var lastPhrase = S.performChart.phrases[S.performChart.phrases.length - 1];
  if (lastPhrase && nowSec > lastPhrase.endSec + 1) {
    finishPerformance();
    return;
  }

  render();
  _performRAF = requestAnimationFrame(updatePerformanceFrame);
}

function maybeScorePendingEvents(nowSec) {
  var chart = S.performChart;
  if (!chart) return;
  var snapshot = PerformanceInput.getSnapshot(nowSec);
  S.performInputSource = PerformanceInput.activeMode;
  S.performInputNotes = snapshot.pitchClasses.slice();

  for (var i = 0; i < chart.events.length; i++) {
    var evt = chart.events[i];
    if (evt._scored) continue;

    var deltaMs = (nowSec - evt.t) * 1000;

    if (deltaMs < -S.performWindowMissMs) continue;

    // Past miss window — mark as miss
    if (deltaMs > S.performWindowMissMs && !evt._hit) {
      evt._scored = true;
      evt._miss = true;
      evt._result = { score: 0, grade: "miss", noteScore: 0, timingScore: 0 };
      evt._score = 0;
      updatePhraseStats(S.performPhraseStats, evt, evt._result);
      S.performCombo = 0;
      _updatePerformanceAccuracy(chart);
      continue;
    }

    // In scoring window — check snapshot
    if (snapshot.pitchClasses.length > 0) {
      var result = scorePerformanceEvent(evt, snapshot, deltaMs, S.performDifficulty, S.performMode);

      if (result.grade !== "miss") {
        evt._scored = true;
        evt._hit = true;
        evt._result = result;
        evt._score = result.score;
        updatePhraseStats(S.performPhraseStats, evt, result);

        S.performCombo++;
        if (S.performCombo > S.performMaxCombo) S.performMaxCombo = S.performCombo;

        var comboMult = Math.min(1 + S.performCombo * 0.1, 4);
        S.performScore += Math.round(100 * result.score * comboMult);

        S.performLastHitLabel = result.grade.toUpperCase() + "!";
        S.performLastHitTime = Date.now();

        _updatePerformanceAccuracy(chart);
      }
    }
  }
}

function _updatePerformanceAccuracy(chart) {
  var scored = 0, hits = 0;
  for (var i = 0; i < chart.events.length; i++) {
    if (chart.events[i]._scored) {
      scored++;
      if (chart.events[i]._hit) hits++;
    }
  }
  S.performAccuracy = scored > 0 ? Math.round((hits / scored) * 100) : 0;
}

function applyPerformanceStemPreset(preset) {
  S.performPracticePreset = preset;
  if (typeof setStemMuted !== "function") return;
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
      setStemMuted("vocals", false);
      setStemMuted("drums", false);
      setStemMuted("bass", false);
      setStemMuted("piano", false);
      setStemMuted("other", false);
      break;
    case "guitar_quiet":
      setStemMuted("guitar", false);
      setStemMuted("vocals", false);
      setStemMuted("drums", false);
      setStemMuted("bass", false);
      setStemMuted("piano", false);
      setStemMuted("other", false);
      if (typeof setStemVolume === "function") setStemVolume(0.3);
      break;
    case "guitar_solo":
      setStemMuted("guitar", false);
      setStemMuted("vocals", true);
      setStemMuted("drums", true);
      setStemMuted("bass", true);
      setStemMuted("piano", true);
      setStemMuted("other", true);
      break;
  }
}

function finishPerformance() {
  stopPerformance();
  S.performResults = finalizePerformanceResults(S.performChart, S.performPhraseStats);
  S.performStarRating = S.performResults.stars;

  var xpAward = Math.max(5, Math.round(S.performResults.accuracy / 10));
  S.xp += xpAward;
  S.xpToast = { amount: xpAward, time: Date.now() };
  logHistory("perform", S.performResults.title + " - " + S.performResults.accuracy + "% accuracy", xpAward);

  saveState();
  S.screen = SCR.PERFORM_DONE;
  render();
}
