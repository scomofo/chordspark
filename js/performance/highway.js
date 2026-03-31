/* ===== ChordSpark Performance: Highway Renderer ===== */

var HIGHWAY_HEIGHT = 400;
var HITLINE_Y = (typeof PERFORMANCE_CONFIG !== "undefined") ? PERFORMANCE_CONFIG.highway.hitLineTopPx : 340;

function performanceEventY(evtTime, nowSec, scrollSpeed) {
  var deltaSec = evtTime - nowSec;
  return HITLINE_Y - (deltaSec * scrollSpeed);
}

function renderPerformanceEvent(evt, nowSec, scrollSpeed, lookaheadSec) {
  var y = performanceEventY(evt.t, nowSec, scrollSpeed);
  var endY = performanceEventY(evt.t + (evt.dur || 0), nowSec, scrollSpeed);
  var height = Math.max(8, y - endY);

  if (y < -60 || endY > HIGHWAY_HEIGHT + 60) return "";

  var cls = "perform-event";
  if (evt._hit && evt._result) {
    cls += " hit " + evt._result.grade;
  } else if (evt._miss) {
    cls += " miss";
  }
  if (evt.type === "note") cls += " perform-event-note";

  var gradeLabel = "";
  if (evt._result) {
    gradeLabel = '<span class="perform-grade perform-grade-' + evt._result.grade + '">' + evt._result.grade + '</span>';
  }

  return '<div class="' + cls + '" style="top:' + endY + 'px;height:' + height + 'px">' +
    '<span class="perform-event-label">' + escHTML(evt.laneLabel || "") + '</span>' +
    gradeLabel +
    '</div>';
}

function renderPerformancePhraseBanner(chart, nowSec) {
  var phrase = getPerformancePhraseForTime(chart, nowSec);
  if (!phrase) return "";
  return '<div class="perform-phrase-banner">' + escHTML(phrase.name) + '</div>';
}

function renderPerformanceHighway(chart, nowSec) {
  var scrollSpeed = S.performScrollSpeed;
  var lookahead = S.performHighwayLookaheadSec;
  var events = getPerformanceEventsInWindow(chart, nowSec - 1, nowSec + lookahead);

  var h = '<div class="perform-highway" style="height:' + HIGHWAY_HEIGHT + 'px">';
  h += '<div class="perform-hitline" style="top:' + HITLINE_Y + 'px"></div>';
  for (var i = 0; i < events.length; i++) {
    h += renderPerformanceEvent(events[i], nowSec, scrollSpeed, lookahead);
  }
  h += renderPerformancePhraseBanner(chart, nowSec);
  h += '</div>';
  return h;
}
