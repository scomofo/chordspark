/* ===== ChordSpark Performance: Input Normalization ===== */

var PerformanceInput = {
  heldMidiNotes: {},
  recentMidiNoteOns: [],
  recentMicNotes: [],
  latestPitchClasses: [],
  activeMode: "midi",
  _recentBufferSec: 1.5,

  start: function(mode) {
    this.activeMode = mode || "midi";
    this.reset();
  },

  stop: function() {
    this.reset();
  },

  reset: function() {
    this.heldMidiNotes = {};
    this.recentMidiNoteOns = [];
    this.recentMicNotes = [];
    this.latestPitchClasses = [];
  },

  onMidiMessage: function(event) {
    if (!event || !event.data || event.data.length < 3) return;
    var cmd = event.data[0] & 0xf0;
    var note = event.data[1];
    var vel = event.data[2];
    var nowSec = PerformanceTransport.now();

    if (cmd === 0x90 && vel > 0) {
      this.heldMidiNotes[note] = true;
      this.recentMidiNoteOns.push({ note: note, tSec: nowSec });
      var cutoff = nowSec - this._recentBufferSec;
      while (this.recentMidiNoteOns.length > 0 && this.recentMidiNoteOns[0].tSec < cutoff) {
        this.recentMidiNoteOns.shift();
      }
      this._updatePitchClasses();
    } else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) {
      delete this.heldMidiNotes[note];
      this._updatePitchClasses();
    }
  },

  onMicUpdate: function(notes) {
    if (!notes || !Array.isArray(notes)) {
      this.recentMicNotes = [];
      this.latestPitchClasses = [];
      return;
    }
    this.recentMicNotes = notes.slice();
    this.latestPitchClasses = _dedupePitchClasses(notes);
  },

  getSnapshot: function(nowSec) {
    if (this.activeMode === "midi") {
      return {
        mode: "midi",
        pitchClasses: this.latestPitchClasses.slice(),
        heldMidiNotes: Object.keys(this.heldMidiNotes).map(Number),
        recentAttacks: this.recentMidiNoteOns.slice()
      };
    }
    return {
      mode: "mic",
      pitchClasses: this.latestPitchClasses.slice(),
      heldMidiNotes: [],
      recentAttacks: []
    };
  },

  getLatestPitchClasses: function() {
    return this.latestPitchClasses.slice();
  },

  getRecentAttacks: function(nowSec, windowMs) {
    var cutoff = nowSec - (windowMs / 1000);
    return this.recentMidiNoteOns.filter(function(a) { return a.tSec >= cutoff; });
  },

  _updatePitchClasses: function() {
    var held = Object.keys(this.heldMidiNotes).map(Number);
    var names = [];
    for (var i = 0; i < held.length; i++) {
      names.push(NOTE_NAMES[held[i] % 12]);
    }
    this.latestPitchClasses = _dedupePitchClasses(names);
  }
};

function _dedupePitchClasses(arr) {
  var seen = {};
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    var n = arr[i];
    if (!seen[n]) { seen[n] = true; result.push(n); }
  }
  return result;
}
