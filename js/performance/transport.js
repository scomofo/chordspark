/* ===== ChordSpark Performance: Transport Clock ===== */

var PerformanceTransport = {
  _playing: false,
  _startedPerfMs: 0,
  _offsetSec: 0,
  _speed: 1,
  _pausedSec: 0,

  start: function(fromSec, speed) {
    this._offsetSec = fromSec || 0;
    this._speed = speed || 1;
    this._startedPerfMs = performance.now();
    this._playing = true;
    this._pausedSec = 0;
  },

  pause: function() {
    if (!this._playing) return;
    this._pausedSec = this.now();
    this._playing = false;
  },

  resume: function() {
    if (this._playing) return;
    this._offsetSec = this._pausedSec;
    this._startedPerfMs = performance.now();
    this._playing = true;
  },

  stop: function() {
    this._playing = false;
    this._pausedSec = 0;
    this._offsetSec = 0;
  },

  seek: function(sec) {
    this._offsetSec = sec;
    this._startedPerfMs = performance.now();
    if (!this._playing) this._pausedSec = sec;
  },

  setSpeed: function(speed) {
    if (this._playing) {
      var cur = this.now();
      this._offsetSec = cur;
      this._startedPerfMs = performance.now();
    }
    this._speed = speed;
  },

  now: function() {
    if (!this._playing) return this._pausedSec;
    var elapsedMs = performance.now() - this._startedPerfMs;
    return this._offsetSec + (elapsedMs / 1000) * this._speed;
  },

  isPlaying: function() {
    return this._playing;
  }
};
