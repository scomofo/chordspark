(function(){

  function createPerformanceChartShell() {
    return {
      id: "",
      songId: "",
      title: "",
      artist: "",
      arrangementType: "",
      bpm: 120,
      phrases: [],
      events: []
    };
  }

  function createPerformanceEventShell() {
    return {
      id: 0,
      t: 0,
      dur: 0,
      type: "chord",
      target: null,
      hand: "RH",
      performance: {
        laneLabel: "",
        phraseId: 0
      }
    };
  }

  function createPerformanceResultShell() {
    return {
      songId: "",
      arrangementType: "",
      difficultyId: "",
      accuracy: 0,
      stars: 0,
      score: 0,
      maxCombo: 0,
      phrases: []
    };
  }

  function createPracticePlanShell() {
    return {
      generatedDate: "",
      focus: "",
      items: []
    };
  }

  function createAnalyticsSummaryShell() {
    return {
      weakestTransitions: [],
      weakestSongs: [],
      weakestPhrases: [],
      strongestSkills: [],
      recentImprovement: [],
      practiceConsistency: {},
      recommendations: []
    };
  }

  window.createPerformanceChartShell = createPerformanceChartShell;
  window.createPerformanceEventShell = createPerformanceEventShell;
  window.createPerformanceResultShell = createPerformanceResultShell;
  window.createPracticePlanShell = createPracticePlanShell;
  window.createAnalyticsSummaryShell = createAnalyticsSummaryShell;

})();
