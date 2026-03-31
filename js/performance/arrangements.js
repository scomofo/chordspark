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

  function expandStrumPattern(pattern, barDur, chordName, chordNotes, startSec, phraseId) {
    if (!pattern || !pattern.length) return [];
    var slotDur = barDur / pattern.length;
    var events = [];
    for (var i = 0; i < pattern.length; i++) {
      var dir = pattern[i];
      if (dir === "x" || dir === "X") continue; // skip rests
      events.push({
        t: startSec + i * slotDur,
        dur: slotDur * 0.8,
        type: "strum",
        chord: chordName,
        laneLabel: (dir === "U" ? "\u2191 " : "\u2193 ") + chordName,
        notes: chordNotes || [],
        strum: dir,
        rhythm: { dir: dir, slot: i, patternName: "song_pattern" }
      });
    }
    return events;
  }

  function buildRhythmChordArrangement(perfSong) {
    if (!perfSong || !perfSong.progression || !perfSong.progression.length) return null;

    var bpm = perfSong.bpm || 100;
    var barDur = (60 / bpm) * 4;
    var pattern = perfSong.pattern || ["D","D","U","U","D","U"];
    var events = [];
    var evtId = 1;

    for (var i = 0; i < perfSong.progression.length; i++) {
      var chord = perfSong.progression[i];
      var notes = [];
      if (typeof CHORD_NOTES !== "undefined" && CHORD_NOTES[chord]) {
        notes = CHORD_NOTES[chord].slice();
      }
      var barStart = i * barDur;
      var strums = expandStrumPattern(pattern, barDur, chord, notes, barStart, 0);
      for (var j = 0; j < strums.length; j++) {
        strums[j].id = evtId++;
        events.push(strums[j]);
      }
    }

    return {
      id: perfSong.id + "_rhythm",
      mode: "rhythm_chords",
      bpm: bpm,
      events: events
    };
  }

  function buildPhraseMarkersFromBars(perfSong, barsPerPhrase) {
    barsPerPhrase = barsPerPhrase || 4;
    var bpm = perfSong.bpm || 100;
    var barDur = (60 / bpm) * 4;
    var totalBars = perfSong.progression ? perfSong.progression.length : 0;
    var phrases = [];
    var phraseId = 0;

    for (var bar = 0; bar < totalBars; bar += barsPerPhrase) {
      var endBar = Math.min(bar + barsPerPhrase, totalBars);
      phrases.push({
        id: phraseId,
        name: "Phrase " + (phraseId + 1),
        startSec: bar * barDur,
        endSec: endBar * barDur
      });
      phraseId++;
    }
    return phrases;
  }

  window.buildChordArrangement = buildChordArrangement;
  window.buildPhraseMarkers = buildPhraseMarkers;
  window.buildRhythmChordArrangement = buildRhythmChordArrangement;
  window.buildPhraseMarkersFromBars = buildPhraseMarkersFromBars;
  window.expandStrumPattern = expandStrumPattern;

})();
