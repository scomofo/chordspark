// ===== STATE =====
var S={
  screen:SCR.HOME,tab:TAB.PRACTICE,xp:0,streak:0,sessions:0,drillCount:0,dailyDone:0,quizCorrect:0,songsPlayed:0,
  level:1,chordProgress:{},selectedLevel:1,soundOn:true,darkMode:true,
  currentChord:null,timer:120,timerActive:false,
  showConfetti:false,earnedBadges:[],newBadge:null,
  drillChords:[],drillIdx:0,drillTimer:60,drillSwitches:0,
  dailyChallenge:null,dailyTimer:0,dailyComplete:false,
  quizQ:null,quizOpts:[],quizAns:null,quizScore:0,quizTotal:0,quizStreak:0,
  strumActive:false,selectedStrum:null,_strumBeat:-1,
  selectedSong:null,songBeat:0,songPlaying:false,
  tunerActive:false,tunerNote:null,tunerFreq:0,tunerCents:0,tunerErr:null,
  lastSessionDate:null,
  metronomeOn:false,metronomeBpm:80,_metroBeat:0,_metroBeats:4,
  chordDetectOn:false,detectedNotes:[],chordMatch:-1,chordDetectErr:null,
  // History & Analytics
  history:[],
  // Custom Practice Sets
  customSets:[],editingSet:false,editingSetIdx:-1,customSetName:"",customSetChords:[],
  // Undo
  showUndoToast:false,undoTimer:5,
  // Ear Training
  earTrainQ:null,earTrainOpts:[],earTrainAns:null,earTrainScore:0,earTrainTotal:0,earTrainStreak:0,
  // Alternate Voicings
  selectedVoicing:0,
  // Transition Difficulty
  transitionStats:{},drillLastSwitchTime:0,
  // Practice Timer Goals
  dailyGoalMinutes:15,todayPracticeSeconds:0,lastPracticeDate:null,goalReachedToday:false,goalStreak:0,
  // Rhythm Game
  rhythmActive:false,rhythmScore:0,rhythmCombo:0,rhythmMaxCombo:0,rhythmBpm:100,
  rhythmBeats:[],rhythmStartTime:0,rhythmResults:null,
  // Chord Progression Builder
  progChords:[],progPlaying:false,progBeat:0,progBpm:80,progPickerOpen:false,
  // Export/Import
  importMsg:null,
  // Community Song Library
  communityTab:"browse",communitySongs:[],communityLoading:false,communityError:null,
  communitySearch:"",communitySort:"votes",
  submitSong:{title:"",artist:"",chords:[],progression:[],bpm:100,pattern:[],submittedBy:""},
  songsSubTab:"builtin",
  // Keyboard Shortcuts
  showShortcuts:false,
  // Import Chord Sheets
  importText:"",importedSong:null,importError:null,importedSongs:[],
  // Sound Effects Pack
  strumTone:"classic",
  // Scale Explorer
  selectedScale:"pentatonic",
  // Audio Input
  audioInputId:"",audioInputDevices:[],audioTestLevel:0,audioTestingId:"",
  // MIDI Output
  midiEnabled:false,midiOutput:null,midiOutputId:"",midiDevices:[],
  // ADHD-friendly
  xpToast:null,sessionStartTime:0,breakDismissed:false,
  lastChordName:"",focusMode:false,microToast:null,sessionMicros:[],
  // Onboarding
  onboardingDone:false,practiceIntention:"",
  // Dual instrument view
  dualChord:"G Major",dualAnchorOn:true,
  // Song sort
  songSort:"level",songSortAsc:true,songFilter:"",
  // Adaptive drill
  drillAdaptiveBpm:60,drillConsecutiveFast:0,drillConsecutiveSlow:0,
  // Guided sessions
  guidedSession:1,completedGuidedSessions:[],guidedPlan:null,
  // Finger exercises
  fingerExTimer:0,fingerExActive:false,fingerExId:null,fingerExCount:0,fingerStats:{},
  guidedStep:null,newMovePhase:null,guidedPaused:false,
  // Stem Separation
  stemFile:null,stemStatus:"idle",stemProgress:0,stemError:null,
  stemPaths:null,stemPlaying:false,stemVolume:0.8,stemCurrentTime:0,stemDuration:0,
  stemToggles:{vocals:true,drums:true,bass:true,guitar:false,piano:false,other:false},
  // Song Audio Import
  songAudioData:{},
  songAudioImporting:false,
  songAudioProgress:0,
  songAudioImportingSongId:null,
  // Chord Runner
  runnerActive:false,runnerScore:0,runnerCombo:0,runnerMaxCombo:0,
  runnerLives:3,runnerTarget:null,runnerObstacles:[],runnerSpeed:2,
  runnerLastSpawn:0,runnerStartTime:0,runnerResults:null,runnerHighScore:0,runnerDistance:0,
  performSongId:null,
  performSongData:null,
  performMode:"midi",
  performDifficulty:"normal",
  performChartId:null,
  performChart:null,
  performPlaying:false,
  performPaused:false,
  performCurrentSec:0,
  performStartSec:0,
  performSpeed:1.0,
  performScrollSpeed:180,
  performLoop:null,
  performScore:0,
  performCombo:0,
  performMaxCombo:0,
  performAccuracy:0,
  performPhraseIdx:0,
  performResults:null,
  performStarRating:0,
  performPhraseStats:[],
  performWindowPerfectMs:70,
  performWindowGoodMs:140,
  performWindowMissMs:220,
  performInputSource:"midi",
  performInputNotes:[],
  performPracticePreset:"no_guitar",
  performAssistHints:true,
  performCountIn:true,
  performCountdownActive:false,
  performCountdownBeats:0,
  performHighwayLookaheadSec:3.0,
  performLastHitLabel:"",
  performLastHitTime:0,
  performDebug:false,
  performPracticeMode:"full",
  performTargetPhrase:null,
  performSongStats:{},
  performArrangementType:"chords",
  performanceStats:{},
  performanceUnlocks:{},
  performanceDailyChallenge:null,
  performanceDailyComplete:false,
  performanceDailyHistory:[],
  performTimingOffsetMs:0,
  performMidiOffsetMs:0,
  performMicOffsetMs:120,
  performStemOffsetMs:0,
  performAudioOffsetMs:0,
  performCalibrated:false,
  performCalibrationMode:false,
  performCalibrationSource:"midi",
  performCalibrationHits:[],
  performanceBadges:[],
  performanceMilestoneToast:null,
  performEditorChart:null,
  performEditorDirty:false,
  performEditorSelectedEventId:null,
  performEditorMode:"chords",
  performEditorSongId:null,
  performEditorSnap:"1/4",
  performEditorPlayheadSec:0,
  performEditorLibrary:[],

  // Skill tree
  skillTreeFocus:"overview",
  skillTreeSelectedNode:null,

  // Practice plan
  practicePlan:null,
  practicePlanDate:null,
  practicePlanComplete:false,
  practicePlanHistory:[],
  practicePlanFocus:"",
};

var T={session:null,drill:null,daily:null,song:null,strum:null,metro:null,undo:null,rhythm:null,prog:null};

// Undo backup
var _undoBackup=null;

// ===== PERSISTENCE =====
var SAVE_KEY="chordspark_state";
var PERSIST_FIELDS=["xp","streak","sessions","drillCount","dailyDone","quizCorrect","songsPlayed",
  "level","chordProgress","soundOn","darkMode","earnedBadges","selectedLevel","lastSessionDate",
  "history","customSets","earTrainScore","transitionStats",
  "dailyGoalMinutes","todayPracticeSeconds","lastPracticeDate","goalReachedToday","goalStreak",
  "importedSongs","strumTone","midiEnabled","midiOutputId","audioInputId","lastChordName","focusMode","runnerHighScore",
  "onboardingDone","practiceIntention","guidedSession","completedGuidedSessions","fingerStats",
  "performMode","performDifficulty","performSpeed","performPracticePreset","performAssistHints","performCountIn",
  "performPracticeMode","performSongStats","performArrangementType",
  "performanceStats","performanceUnlocks","performanceBadges",
  "performMidiOffsetMs","performAudioOffsetMs","performCalibrated",
  "performanceDailyHistory",
  "performEditorLibrary",
  "practicePlan","practicePlanDate","practicePlanHistory"];

// Debounced save — prevents localStorage thrashing on rapid actions (drills, quizzes)
var _saveTimer=null;
function saveState(immediate){
  if(immediate){_doSave();return;}
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(_doSave,300);
}
function _doSave(){
  try{
    var data=buildPersistedStateSnapshot(S,PERSIST_FIELDS);
    // Cap history at 500 entries
    if(data.history) data.history=capArray(data.history,500);
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){console.error("ChordSpark: saveState failed",e);}
}

function loadState(){
  try{
    var raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return;
    var data=safeJsonParse(raw,null);
    if(!data)return;
    applyPersistedStateSnapshot(S,data,PERSIST_FIELDS);
    // Ensure arrays
    if(!Array.isArray(S.history))S.history=[];
    if(!Array.isArray(S.customSets))S.customSets=[];
    if(typeof S.transitionStats!=="object"||S.transitionStats===null)S.transitionStats={};
    if(!Array.isArray(S.importedSongs))S.importedSongs=[];
  }catch(e){console.error("ChordSpark: loadState failed — data may be corrupted",e);}
}

function resetProgress(){
  // Save backup for undo — keep old data in localStorage until undo expires
  _undoBackup=JSON.parse(JSON.stringify(buildPersistedStateSnapshot(S,PERSIST_FIELDS)));
  _undoBackup._backupTime=Date.now();
  try{localStorage.setItem(SAVE_KEY+"_backup",JSON.stringify(_undoBackup));}catch(e){console.error("ChordSpark: undo backup save failed",e);}
  // Clear state in memory (localStorage cleared only when undo timer expires)
  S.xp=0;S.streak=0;S.sessions=0;S.drillCount=0;S.dailyDone=0;S.quizCorrect=0;S.songsPlayed=0;
  S.level=1;S.chordProgress={};S.earnedBadges=[];S.selectedLevel=1;S.lastSessionDate=null;
  S.history=[];S.customSets=[];S.earTrainScore=0;S.transitionStats={};
  S.dailyGoalMinutes=15;S.todayPracticeSeconds=0;S.lastPracticeDate=null;S.goalReachedToday=false;S.goalStreak=0;
  S.importedSongs=[];S.lastChordName="";
  // Show undo toast
  S.showUndoToast=true;S.undoTimer=5;
  render();
  clearInterval(T.undo);
  T.undo=setInterval(function(){
    S.undoTimer--;
    if(S.undoTimer<=0){
      clearInterval(T.undo);T.undo=null;
      S.showUndoToast=false;_undoBackup=null;
      removePersistedBackup(SAVE_KEY+"_backup");
      saveState();
    }
    render();
  },1000);
}

function undoReset(){
  if(!_undoBackup)return;
  clearInterval(T.undo);T.undo=null;
  for(var k in _undoBackup){
    S[k]=_undoBackup[k];
  }
  _undoBackup=null;
  S.showUndoToast=false;
  removePersistedBackup(SAVE_KEY+"_backup");
  saveState(true);render();
}

// Recover from crash during reset undo window
function recoverFromCrash(){
  try{
    var raw=localStorage.getItem(SAVE_KEY+"_backup");
    if(raw){
      var data=safeJsonParse(raw,null);
      if(!data){removePersistedBackup(SAVE_KEY+"_backup");return;}
      // Only restore if backup has a valid timestamp and is less than 1 hour old
      if(!data._backupTime||Date.now()-data._backupTime>3600000){
        removePersistedBackup(SAVE_KEY+"_backup");
        return;
      }
      applyPersistedStateSnapshot(S,data,PERSIST_FIELDS);
      removePersistedBackup(SAVE_KEY+"_backup");
      saveState(true);
    }
  }catch(e){console.error("ChordSpark: recoverFromCrash failed",e);}
}

function checkStreak(){
  var today=new Date().toISOString().split("T")[0];
  if(S.lastSessionDate){
    // Normalise: legacy data may be stored as toDateString() format
    var last=new Date(S.lastSessionDate);
    var lastISO=last.toISOString().split("T")[0];
    var diff=Math.floor((new Date(today)-new Date(lastISO))/86400000);
    if(diff>1){S.streak=0;saveState(true);}
  }
}

function checkPracticeDate(){
  var today=new Date().toISOString().split("T")[0];
  if(S.lastPracticeDate!==today){
    // Check if previous day goal was met before resetting
    if(S.lastPracticeDate&&S.goalReachedToday){
      S.goalStreak++;
    } else if(S.lastPracticeDate&&!S.goalReachedToday){
      S.goalStreak=0;
    }
    S.todayPracticeSeconds=0;
    S.goalReachedToday=false;
    S.lastPracticeDate=today;
    saveState();
  }
}

function addPracticeSecond(){
  checkPracticeDate();
  S.todayPracticeSeconds++;
  if(!S.goalReachedToday&&S.todayPracticeSeconds>=S.dailyGoalMinutes*60){
    S.goalReachedToday=true;
    snd("levelup");
    saveState();
  }
}

function logHistory(type,detail,xp){
  var now=new Date();
  S.history.push({
    type:type,
    date:now.toISOString().split("T")[0],
    timestamp:now.getTime(),
    xp:xp,
    detail:detail
  });
}

// Load saved progress
loadState();
recoverFromCrash();
checkStreak();
checkPracticeDate();
S.sessionStartTime=Date.now();
