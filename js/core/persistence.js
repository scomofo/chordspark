(function(){

  var _saveTimer = null;
  var SAVE_DEBOUNCE_MS = 500;
  var MAX_HISTORY_LENGTH = 200;

  function debouncedSave() {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function() {
      _saveTimer = null;
      if (typeof saveState === "function") saveState();
    }, SAVE_DEBOUNCE_MS);
  }

  function capArray(arr, max) {
    max = max || MAX_HISTORY_LENGTH;
    if (Array.isArray(arr) && arr.length > max) {
      arr.splice(0, arr.length - max);
    }
    return arr;
  }

  function capHistoryFields(state) {
    if (state.practiceHistory) capArray(state.practiceHistory, MAX_HISTORY_LENGTH);
    if (state.transitionHistory) capArray(state.transitionHistory, MAX_HISTORY_LENGTH);
    if (state.performHistory) capArray(state.performHistory, MAX_HISTORY_LENGTH);
    if (state.sessionHistory) capArray(state.sessionHistory, MAX_HISTORY_LENGTH);
    return state;
  }

  function migrateState(state, version) {
    // Add migration steps as needed. Each migration bumps the version.
    if (!state._version) state._version = 1;

    // Example: if (state._version < 2) { state.newField = defaultValue; state._version = 2; }

    return state;
  }

  window.debouncedSave = debouncedSave;
  window.capArray = capArray;
  window.capHistoryFields = capHistoryFields;
  window.migrateState = migrateState;

})();
