/* ===== ChordSpark Performance: Chart Loader ===== */

function loadPerformanceChart(chartId) {
  return fetch("data/performance_charts/" + chartId + ".json")
    .then(function(r) {
      if (!r.ok) throw new Error("Chart not found: " + chartId);
      return r.json();
    })
    .then(function(chart) {
      return normalizePerformanceChart(chart);
    });
}

function normalizePerformanceChart(chart) {
  if (!chart.phrases) chart.phrases = [];
  if (!chart.events) chart.events = [];
  chart.events.sort(function(a, b) { return a.t - b.t; });
  for (var i = 0; i < chart.events.length; i++) {
    var evt = chart.events[i];
    evt.phraseId = _findPhraseIdForTime(chart, evt.t);
    evt._hit = false;
    evt._miss = false;
    evt._scored = false;
    evt._result = null;
    evt._score = 0;
  }
  return chart;
}

function _findPhraseIdForTime(chart, sec) {
  for (var i = 0; i < chart.phrases.length; i++) {
    var p = chart.phrases[i];
    if (sec >= p.startSec && sec < p.endSec) return p.id;
  }
  return chart.phrases.length > 0 ? chart.phrases[chart.phrases.length - 1].id : 0;
}

function getPerformanceEventsInWindow(chart, fromSec, toSec) {
  var result = [];
  for (var i = 0; i < chart.events.length; i++) {
    var evt = chart.events[i];
    var evtEnd = evt.t + (evt.dur || 0);
    if (evt.t < toSec && evtEnd > fromSec) result.push(evt);
  }
  return result;
}

function getPerformancePhraseForTime(chart, sec) {
  for (var i = 0; i < chart.phrases.length; i++) {
    var p = chart.phrases[i];
    if (sec >= p.startSec && sec < p.endSec) return p;
  }
  return chart.phrases[chart.phrases.length - 1] || null;
}

function getPerformancePhraseIndexForTime(chart, sec) {
  for (var i = 0; i < chart.phrases.length; i++) {
    var p = chart.phrases[i];
    if (sec >= p.startSec && sec < p.endSec) return i;
  }
  return chart.phrases.length - 1;
}

function clonePerformanceChart(chart) {
  return normalizePerformanceChart(JSON.parse(JSON.stringify(chart)));
}
