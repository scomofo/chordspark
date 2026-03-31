(function(){

  function buildChordArrangement(perfSong) {
    if (!perfSong || !perfSong.progression || !perfSong.progression.length) return null;

    var events = [];
    var beatDur = 60 / (perfSong.bpm || 100);

    // Look up chord notes from existing CHORD_NOTES if available
    for (var i = 0; i < perfSong.progression.length; i++) {
      var chord = perfSong.progression[i];
      var notes = [];
      if (typeof CHORD_NOTES !== "undefined" && CHORD_NOTES[chord]) {
        notes = CHORD_NOTES[chord].slice();
      }
      events.push({
        id: i + 1,
        t: i * beatDur,
        dur: beatDur,
        type: "chord",
        chord: chord,
        laneLabel: chord,
        notes: notes,
        strum: "down"
      });
    }

    return {
      id: perfSong.id + "_chords",
      mode: "chords",
      bpm: perfSong.bpm,
      events: events
    };
  }

  function buildPhraseMarkers(arrangement) {
    if (!arrangement || !arrangement.events || !arrangement.events.length) return [];

    var phrases = [];
    var eventsPerPhrase = (typeof PERFORMANCE_CONFIG !== "undefined") ? PERFORMANCE_CONFIG.defaultPhraseEventCount : 8;
    var current = 0;
    var phraseId = 0;

    while (current < arrangement.events.length) {
      var startEvent = arrangement.events[current];
      var endIndex = Math.min(current + eventsPerPhrase - 1, arrangement.events.length - 1);
      var endEvent = arrangement.events[endIndex];

      phrases.push({
        id: phraseId,
        name: "Phrase " + (phraseId + 1),
        startSec: startEvent.t,
        endSec: endEvent.t + endEvent.dur
      });

      phraseId++;
      current += eventsPerPhrase;
    }

    return phrases;
  }

  window.buildChordArrangement = buildChordArrangement;
  window.buildPhraseMarkers = buildPhraseMarkers;

})();
