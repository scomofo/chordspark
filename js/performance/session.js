/* ===== ChordSpark Performance: Session Orchestrator ===== */

var _performRAF = null;

function startPerformance(chartId, opts) {
  opts = opts || {};
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

    PerformanceInput.start(S.performMode);
    applyPerformanceStemPreset(S.performPracticePreset);
    PerformanceTransport.start(0, S.performSpeed);

    S.screen = SCR.PERFORM;
    render();

    _performRAF = requestAnimationFrame(updatePerformanceFrame);
  }).catch(function(err) {
    console.error("ChordSpark: Failed to start performance:", err);
    S.screen = SCR.HOME;
    S.tab = TAB.SONGS;
    render();
  });
}

function stopPerformance() {
  PerformanceTransport.stop();
  PerformanceInput.stop();
  S.performPlaying = false;
  S.performPaused = false;
  if (_performRAF) { cancelAnimationFrame(_performRAF); _performRAF = null; }
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
  if (!S.performPlaying || S.performPaused) return;

  var nowSec = PerformanceTransport.now();
  S.performCurrentSec = nowSec;
  S.performPhraseIdx = getPerformancePhraseIndexForTime(S.performChart, nowSec);

  maybeScorePendingEvents(nowSec);

  // Loop enforcement
  if (S.performLoop && nowSec >= S.performLoop.endSec) {
    PerformanceTransport.seek(S.performLoop.startSec);
    var events = S.performChart.events;
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (e.t >= S.performLoop.startSec && e.t < S.performLoop.endSec) {
        e._hit = false;
        e._miss = false;
        e._scored = false;
        e._result = null;
        e._score = 0;
      }
    }
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
