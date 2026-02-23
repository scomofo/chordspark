// ===== STATE =====
var S={
  screen:SCR.HOME,tab:TAB.PRACTICE,xp:0,streak:0,sessions:0,drillCount:0,dailyDone:0,quizCorrect:0,songsPlayed:0,
  level:1,chordProgress:{},selectedLevel:1,soundOn:true,darkMode:false,
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
  // MIDI Output
  midiEnabled:false,midiOutput:null,midiOutputId:"",midiDevices:[],
  // ADHD-friendly
  xpToast:null,sessionStartTime:0,breakDismissed:false,
  lastChordName:"",focusMode:false,microToast:null,sessionMicros:[],
  // Stem Separation
  stemFile:null,stemStatus:"idle",stemProgress:0,stemError:null,
  stemPaths:null,stemPlaying:false,stemVolume:0.8,stemCurrentTime:0,stemDuration:0,
  stemToggles:{vocals:true,drums:true,bass:true,guitar:false,piano:false,other:false}
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
  "importedSongs","strumTone","midiEnabled","midiOutputId","lastChordName","focusMode"];

function saveState(){
  try{
    var data={};
    for(var i=0;i<PERSIST_FIELDS.length;i++){
      data[PERSIST_FIELDS[i]]=S[PERSIST_FIELDS[i]];
    }
    // Cap history at 500 entries
    if(data.history&&data.history.length>500){
      data.history=data.history.slice(data.history.length-500);
    }
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}

function loadState(){
  try{
    var raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return;
    var data=JSON.parse(raw);
    for(var i=0;i<PERSIST_FIELDS.length;i++){
      if(data[PERSIST_FIELDS[i]]!==undefined){
        S[PERSIST_FIELDS[i]]=data[PERSIST_FIELDS[i]];
      }
    }
    // Ensure arrays
    if(!Array.isArray(S.history))S.history=[];
    if(!Array.isArray(S.customSets))S.customSets=[];
    if(typeof S.transitionStats!=="object"||S.transitionStats===null)S.transitionStats={};
    if(!Array.isArray(S.importedSongs))S.importedSongs=[];
  }catch(e){}
}

function resetProgress(){
  // Save backup for undo
  _undoBackup={};
  for(var i=0;i<PERSIST_FIELDS.length;i++){
    var val=S[PERSIST_FIELDS[i]];
    _undoBackup[PERSIST_FIELDS[i]]=JSON.parse(JSON.stringify(val));
  }
  // Clear state
  localStorage.removeItem(SAVE_KEY);
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
  saveState();render();
}

function checkStreak(){
  var today=new Date().toDateString();
  if(S.lastSessionDate){
    var last=new Date(S.lastSessionDate);
    var diff=Math.floor((new Date(today)-last)/86400000);
    if(diff>1){S.streak=0;saveState();}
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
checkStreak();
checkPracticeDate();
S.sessionStartTime=Date.now();
