(function(){

  function buildPerformanceSongFromBuiltin(song) {
    if (!song) return null;
    return {
      id: (song.title || "song").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      title: song.title,
      artist: song.artist || "Unknown",
      bpm: song.bpm || 100,
      chords: song.chords || [],
      progression: song.progression || [],
      pattern: song.pattern || ["D","D","U","U","D","U"],
      source: "builtin"
    };
  }

  function buildPerformanceSongFromImported(song) {
    if (!song) return null;
    return {
      id: (song.title || "imported").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      title: song.title,
      artist: song.artist || "Imported",
      bpm: song.bpm || 100,
      chords: song.chords || [],
      progression: song.progression || [],
      pattern: song.pattern || ["D","D","U","U","D","U"],
      source: "imported"
    };
  }

  function buildPerformanceChartFromSong(song, sourceType) {
    var perfSong;
    if (sourceType === "imported") {
      perfSong = buildPerformanceSongFromImported(song);
    } else {
      perfSong = buildPerformanceSongFromBuiltin(song);
    }
    if (!perfSong || !perfSong.progression.length) return null;

    var arrangement = buildChordArrangement(perfSong);
    var phrases = buildPhraseMarkers(arrangement);

    return {
      id: perfSong.id + "_perf",
      title: perfSong.title,
      artist: perfSong.artist,
      bpm: perfSong.bpm,
      beatsPerBar: 4,
      offsetSec: 0,
      audio: { type: "silent" },
      events: arrangement.events,
      phrases: phrases
    };
  }

  window.buildPerformanceSongFromBuiltin = buildPerformanceSongFromBuiltin;
  window.buildPerformanceSongFromImported = buildPerformanceSongFromImported;
  window.buildPerformanceChartFromSong = buildPerformanceChartFromSong;

})();
