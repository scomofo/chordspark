// ===== SCREEN & TAB CONSTANTS =====
var SCR={
  HOME:"home",SESSION:"session",COMPLETE:"complete",
  DRILL:"drill",DRILL_DONE:"drillDone",DAILY:"daily",
  QUIZ:"quiz",STRUM:"strumDetail",SONG:"songDetail",
  SONG_DONE:"songDone",STEMS:"stems"
};
var TAB={
  PRACTICE:"practice",DRILL:"drill",DAILY:"daily",QUIZ:"quiz",
  EAR:"ear",STRUM:"strum",SONGS:"songs",RHYTHM:"rhythm",
  BUILD:"build",TUNER:"tuner",STATS:"stats",GUIDE:"guide"
};

// ===== CONSTANTS =====
var NOTE_NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var GUITAR_STRINGS=[{note:"E",freq:82.41},{note:"A",freq:110},{note:"D",freq:146.83},{note:"G",freq:196},{note:"B",freq:246.94},{note:"E",freq:329.63}];
var STRING_NAMES=["E","A","D","G","B","e"];
var LC={1:"#FF6B6B",2:"#4ECDC4",3:"#45B7D1"},LN={1:"Beginner",2:"Intermediate",3:"Advanced"};

// ===== CHORDS =====
// Each chord: {name, short, fingers:[[string,fret,fingerNum,color],...], frets:[per string, -1=muted], open:[bool per string], muted:[string indices], barFret?, barStrings?}
var CHORDS={
1:[
  // --- Original Level 1 ---
  {name:"E Major",short:"E",fingers:[[0,1,1,"#FF6B6B"],[1,2,2,"#4ECDC4"],[2,2,3,"#45B7D1"]],frets:[0,2,2,1,0,0],open:[true,false,false,false,true,true],muted:[]},
  {name:"A Major",short:"A",fingers:[[1,2,2,"#FF6B6B"],[2,2,3,"#4ECDC4"],[3,2,4,"#45B7D1"]],frets:[-1,0,2,2,2,0],open:[false,true,false,false,false,true],muted:[0]},
  {name:"D Major",short:"D",fingers:[[3,2,1,"#FF6B6B"],[4,3,2,"#4ECDC4"],[5,2,3,"#45B7D1"]],frets:[-1,-1,0,2,3,2],open:[false,false,true,false,false,false],muted:[0,1]},
  // --- New Level 1 ---
  {name:"E7",short:"E7",fingers:[[0,1,1,"#FF6B6B"],[1,2,2,"#4ECDC4"]],frets:[0,2,0,1,0,0],open:[true,false,true,false,true,true],muted:[]},
  {name:"A7",short:"A7",fingers:[[1,2,2,"#FF6B6B"],[3,2,3,"#4ECDC4"]],frets:[-1,0,2,0,2,0],open:[false,true,false,true,false,true],muted:[0]},
  {name:"D7",short:"D7",fingers:[[3,2,1,"#FF6B6B"],[4,1,2,"#4ECDC4"],[5,2,3,"#45B7D1"]],frets:[-1,-1,0,2,1,2],open:[false,false,true,false,false,false],muted:[0,1]}
],
2:[
  // --- Original Level 2 ---
  {name:"G Major",short:"G",fingers:[[0,3,2,"#FF6B6B"],[1,2,1,"#4ECDC4"],[5,3,3,"#45B7D1"]],frets:[3,2,0,0,0,3],open:[false,false,true,true,true,false],muted:[]},
  {name:"C Major",short:"C",fingers:[[1,3,3,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,1,1,"#45B7D1"]],frets:[-1,3,2,0,1,0],open:[false,false,false,true,false,true],muted:[0]},
  {name:"E Minor",short:"Em",fingers:[[0,2,2,"#FF6B6B"],[1,2,3,"#4ECDC4"]],frets:[0,2,2,0,0,0],open:[true,false,false,true,true,true],muted:[]},
  // --- New Level 2 ---
  {name:"Am7",short:"Am7",fingers:[[1,1,1,"#FF6B6B"],[2,2,2,"#4ECDC4"]],frets:[-1,0,2,0,1,0],open:[false,true,false,true,false,true],muted:[0]},
  {name:"Em7",short:"Em7",fingers:[[0,2,2,"#FF6B6B"]],frets:[0,2,0,0,0,0],open:[true,false,true,true,true,true],muted:[]},
  {name:"Dm7",short:"Dm7",fingers:[[3,2,2,"#FF6B6B"],[4,1,1,"#4ECDC4"],[5,1,3,"#45B7D1"]],frets:[-1,-1,0,2,1,1],open:[false,false,true,false,false,false],muted:[0,1]},
  {name:"G7",short:"G7",fingers:[[0,3,3,"#FF6B6B"],[1,2,2,"#4ECDC4"],[5,1,1,"#45B7D1"]],frets:[3,2,0,0,0,1],open:[false,false,true,true,true,false],muted:[]},
  {name:"C7",short:"C7",fingers:[[1,3,4,"#FF6B6B"],[2,2,3,"#4ECDC4"],[3,3,2,"#45B7D1"],[4,1,1,"#FFE66D"]],frets:[-1,3,2,3,1,0],open:[false,false,false,false,false,true],muted:[0]},
  {name:"Cadd9",short:"Cadd9",fingers:[[1,3,3,"#FF6B6B"],[2,2,2,"#4ECDC4"],[5,3,4,"#45B7D1"]],frets:[-1,3,2,0,3,0],open:[false,false,false,true,false,true],muted:[0]},
  {name:"Dsus2",short:"Dsus2",fingers:[[4,3,3,"#FF6B6B"],[5,2,2,"#4ECDC4"]],frets:[-1,-1,0,2,3,0],open:[false,false,true,false,false,true],muted:[0,1]},
  {name:"Dsus4",short:"Dsus4",fingers:[[3,2,1,"#FF6B6B"],[4,3,3,"#4ECDC4"],[5,3,4,"#45B7D1"]],frets:[-1,-1,0,2,3,3],open:[false,false,true,false,false,false],muted:[0,1]},
  {name:"Asus2",short:"Asus2",fingers:[[1,2,1,"#FF6B6B"],[2,2,2,"#4ECDC4"]],frets:[-1,0,2,2,0,0],open:[false,true,false,false,true,true],muted:[0]}
],
3:[
  // --- Original Level 3 ---
  {name:"A Minor",short:"Am",fingers:[[1,1,1,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,2,3,"#45B7D1"]],frets:[-1,0,2,2,1,0],open:[false,true,false,false,false,true],muted:[0]},
  {name:"D Minor",short:"Dm",fingers:[[3,1,1,"#FF6B6B"],[4,3,2,"#4ECDC4"],[5,2,3,"#45B7D1"]],frets:[-1,-1,0,2,3,1],open:[false,false,true,false,false,false],muted:[0,1]},
  {name:"F Major",short:"F",fingers:[[0,1,1,"#FF6B6B"],[1,1,1,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,3,3,"#45B7D1"]],frets:[-1,-1,3,2,1,1],open:[],muted:[0,1],barFret:1,barStrings:[4,5]},
  // --- New Level 3 ---
  {name:"B7",short:"B7",fingers:[[1,2,2,"#FF6B6B"],[2,1,1,"#4ECDC4"],[3,2,3,"#45B7D1"],[5,2,4,"#FFE66D"]],frets:[-1,2,1,2,0,2],open:[false,false,false,false,true,false],muted:[0]},
  {name:"B Minor",short:"Bm",fingers:[[0,2,1,"#FF6B6B"],[1,2,1,"#FF6B6B"],[2,4,3,"#4ECDC4"],[3,4,4,"#45B7D1"],[4,3,2,"#FFE66D"]],frets:[-1,2,4,4,3,2],open:[],muted:[0],barFret:2,barStrings:[1,5]},
  {name:"F# Minor",short:"F#m",fingers:[[0,2,1,"#FF6B6B"],[1,2,1,"#FF6B6B"],[2,4,3,"#4ECDC4"],[3,4,4,"#45B7D1"],[4,2,1,"#FF6B6B"]],frets:[-1,-1,4,4,2,2],open:[],muted:[0,1],barFret:2,barStrings:[4,5]},
  {name:"A/C#",short:"A/C#",fingers:[[1,4,4,"#FF6B6B"],[2,2,1,"#4ECDC4"],[3,2,2,"#45B7D1"],[4,2,3,"#FFE66D"]],frets:[-1,4,2,2,2,0],open:[false,false,false,false,false,true],muted:[0]},
  {name:"D/F#",short:"D/F#",fingers:[[0,2,1,"#FF6B6B"],[3,2,2,"#4ECDC4"],[4,3,3,"#45B7D1"],[5,2,4,"#FFE66D"]],frets:[2,0,0,2,3,2],open:[false,true,true,false,false,false],muted:[]}
]};

var ALL_CHORDS=[].concat(CHORDS[1],CHORDS[2],CHORDS[3]);

// ===== CHORD NOTES (pitch classes for detection) =====
var CHORD_NOTES={
  // Original
  "E Major":["E","G#","B"],"A Major":["A","C#","E"],"D Major":["D","F#","A"],
  "G Major":["G","B","D"],"C Major":["C","E","G"],"E Minor":["E","G","B"],
  "A Minor":["A","C","E"],"D Minor":["D","F","A"],"F Major":["F","A","C"],
  // New Level 1
  "E7":["E","G#","B","D"],"A7":["A","C#","E","G"],"D7":["D","F#","A","C"],
  // New Level 2
  "Am7":["A","C","E","G"],"Em7":["E","G","B","D"],"Dm7":["D","F","A","C"],
  "G7":["G","B","D","F"],"C7":["C","E","G","A#"],
  "Cadd9":["C","E","G","D"],"Dsus2":["D","E","A"],"Dsus4":["D","G","A"],"Asus2":["A","B","E"],
  // New Level 3
  "B7":["B","D#","F#","A"],"B Minor":["B","D","F#"],"F# Minor":["F#","A","C#"],
  "A/C#":["C#","A","E"],"D/F#":["F#","D","A"]
};

// ===== BADGES =====
var BADGES=[
  {id:"first_chord",label:"First Chord!",icon:"&#11088;",desc:"Complete your first practice"},
  {id:"streak_3",label:"On Fire!",icon:"&#128293;",desc:"3-day streak"},
  {id:"streak_7",label:"Unstoppable!",icon:"&#128142;",desc:"7-day streak"},
  {id:"level_2",label:"Level Up!",icon:"&#128640;",desc:"Reach Level 2"},
  {id:"level_3",label:"Chord Master",icon:"&#128081;",desc:"Reach Level 3"},
  {id:"ten_sessions",label:"Dedicated!",icon:"&#127919;",desc:"Complete 10 sessions"},
  {id:"drill_5",label:"Quick Fingers!",icon:"&#9889;",desc:"Complete 5 drills"},
  {id:"daily_3",label:"Challenger!",icon:"&#127941;",desc:"Complete 3 daily challenges"},
  {id:"quiz_10",label:"Brain Power!",icon:"&#129504;",desc:"10 quiz questions right"},
  {id:"songs_3",label:"Songwriter!",icon:"&#127925;",desc:"Practice 3 songs"}
];

// ===== STRUM PATTERNS =====
var STRUM_PATTERNS=[
  {name:"Basic Down",level:1,bpm:80,pattern:["D","D","D","D"],desc:"Simple downstrokes"},
  {name:"Down-Up",level:1,bpm:90,pattern:["D","U","D","U","D","U","D","U"],desc:"Alternate down and up"},
  {name:"Folk Strum",level:2,bpm:100,pattern:["D","D","U","U","D","U"],desc:"Classic acoustic pattern"},
  {name:"Pop Rock",level:2,bpm:110,pattern:["D","x","D","U","x","U","D","U"],desc:"Skip beats for drive"},
  {name:"Island Strum",level:2,bpm:95,pattern:["D","x","U","x","U","D","x","U"],desc:"Reggae-inspired groove"},
  {name:"Ballad Strum",level:3,bpm:70,pattern:["D","x","x","U","x","U","D","U"],desc:"Slow and expressive"}
];

// ===== SONGS =====
var SONGS=[
  {title:"Three Little Birds",artist:"Bob Marley",chords:["A","D","E"],level:1,pattern:["D","D","U","U","D","U"],bpm:75,progression:["A","A","D","A","A","A","E","A"]},
  {title:"Horse With No Name",artist:"America",chords:["Em","D"],level:1,pattern:["D","D","U","U","D","U"],bpm:90,progression:["Em","Em","D","D","Em","Em","D","D"]},
  {title:"Knockin on Heavens Door",artist:"Bob Dylan",chords:["G","D","Am","C"],level:2,pattern:["D","D","U","U","D","U"],bpm:68,progression:["G","D","Am","Am","G","D","C","C"]},
  {title:"Wonderful Tonight",artist:"Eric Clapton",chords:["G","D","C","Em"],level:2,pattern:["D","x","D","U","x","U","D","U"],bpm:95,progression:["G","D","C","D","G","D","C","D"]},
  {title:"Let It Be",artist:"The Beatles",chords:["C","G","Am","F"],level:3,pattern:["D","D","U","U","D","U"],bpm:72,progression:["C","G","Am","F","C","G","F","C"]},
  {title:"Wish You Were Here",artist:"Pink Floyd",chords:["Em","G","A","C","D"],level:3,pattern:["D","x","U","x","U","D","x","U"],bpm:62,progression:["Em","G","Em","G","Em","A","Em","A","G","C","D","Am","G","D","C","Am"]},
  // --- Added Songs ---
  {title:"Love Me Do",artist:"The Beatles",chords:["G","C","D"],level:1,pattern:["D","D","U","U","D","U"],bpm:148,progression:["G","G","C","G","G","G","C","G"]},
  {title:"Stand By Me",artist:"Ben E. King",chords:["A","D","E"],level:1,pattern:["D","D","U","U","D","U"],bpm:118,progression:["A","A","D","E","A","A","D","E"]},
  {title:"Jambalaya",artist:"Hank Williams",chords:["A","D","E"],level:1,pattern:["D","U","D","U","D","U","D","U"],bpm:120,progression:["A","A","D","D","A","A","E","A"]},
  {title:"Achy Breaky Heart",artist:"Billy Ray Cyrus",chords:["A","E"],level:1,pattern:["D","D","U","U","D","U"],bpm:120,progression:["A","A","E","E","E","E","A","A"]},
  {title:"Bad Moon Rising",artist:"CCR",chords:["D","A","G"],level:1,pattern:["D","D","U","U","D","U"],bpm:176,progression:["D","D","A","G","D","D","A","G"]},
  {title:"Brown Eyed Girl",artist:"Van Morrison",chords:["G","C","D","Em"],level:2,pattern:["D","D","U","U","D","U"],bpm:150,progression:["G","C","G","D","G","C","G","D"]},
  {title:"Riptide",artist:"Vance Joy",chords:["Am","G","C"],level:2,pattern:["D","x","D","U","x","U","D","U"],bpm:102,progression:["Am","G","C","C","Am","G","C","C"]},
  {title:"Leaving on a Jet Plane",artist:"John Denver",chords:["G","C","D"],level:2,pattern:["D","D","U","U","D","U"],bpm:136,progression:["G","C","G","C","G","C","D","D"]},
  {title:"Hey Soul Sister",artist:"Train",chords:["G","D","Em","C"],level:2,pattern:["D","x","U","x","U","D","x","U"],bpm:97,progression:["G","D","Em","C","G","D","Em","C"]},
  {title:"Have You Ever Seen the Rain",artist:"CCR",chords:["C","G","Am","F"],level:2,pattern:["D","D","U","U","D","U"],bpm:116,progression:["Am","F","C","G","Am","F","C","C"]},
  {title:"Hotel California",artist:"Eagles",chords:["Am","E","G","D","F","C","Dm"],level:3,pattern:["D","x","U","x","U","D","x","U"],bpm:74,progression:["Am","Am","E","E","G","G","D","D","F","F","C","C","Dm","Dm","E","E"]},
  {title:"Creep",artist:"Radiohead",chords:["G","B7","C","Cm"],level:3,pattern:["D","D","U","U","D","U"],bpm:92,progression:["G","G","B7","B7","C","C","Cm","Cm"]},
  {title:"Hallelujah",artist:"Leonard Cohen",chords:["C","Am","F","G","E7"],level:3,pattern:["D","x","U","x","U","D","x","U"],bpm:56,progression:["C","Am","C","Am","F","G","C","G"]},
  {title:"Tears in Heaven",artist:"Eric Clapton",chords:["A","E","F#m","D","E7","A/C#"],level:3,pattern:["D","x","D","U","x","U","D","U"],bpm:80,progression:["A","E","F#m","A/C#","D","E7","A","A"]}
];

// ===== DAILY CHALLENGES =====
var DAILY_CHALLENGES=[
  {id:"speed",title:"Speed Switch",desc:"Switch between 2 chords fast in 60s",xp:50,icon:"&#9889;"},
  {id:"hold",title:"Iron Grip",desc:"Hold a chord shape for 30 seconds",xp:30,icon:"&#128170;"},
  {id:"marathon",title:"Mini Marathon",desc:"Practice 3 chords back to back",xp:75,icon:"&#127939;"},
  {id:"clean",title:"Clean Strum",desc:"Strum each string - no buzzing!",xp:40,icon:"&#10024;"},
  {id:"blind",title:"Blind Switch",desc:"Switch chords without looking",xp:60,icon:"&#128584;"}
];

// ===== ALTERNATE VOICINGS =====
var VOICINGS={
  "E Major":[
    {label:"Open (Standard)",fingers:[[0,1,1,"#FF6B6B"],[1,2,2,"#4ECDC4"],[2,2,3,"#45B7D1"]],frets:[0,2,2,1,0,0],open:[true,false,false,false,true,true],muted:[]},
    {label:"Barre (7th fret)",fingers:[[0,7,1,"#FF6B6B"],[1,7,1,"#FF6B6B"],[2,9,3,"#4ECDC4"],[3,9,4,"#45B7D1"],[4,9,2,"#FFE66D"],[5,7,1,"#FF6B6B"]],frets:[7,7,9,9,9,7],open:[],muted:[],barFret:7,barStrings:[0,5]}
  ],
  "A Major":[
    {label:"Open (Standard)",fingers:[[1,2,2,"#FF6B6B"],[2,2,3,"#4ECDC4"],[3,2,4,"#45B7D1"]],frets:[-1,0,2,2,2,0],open:[false,true,false,false,false,true],muted:[0]},
    {label:"Barre (5th fret)",fingers:[[0,5,1,"#FF6B6B"],[1,5,1,"#FF6B6B"],[2,7,3,"#4ECDC4"],[3,7,4,"#45B7D1"],[4,7,2,"#FFE66D"],[5,5,1,"#FF6B6B"]],frets:[5,5,7,7,7,5],open:[],muted:[],barFret:5,barStrings:[0,5]}
  ],
  "D Major":[
    {label:"Open (Standard)",fingers:[[3,2,1,"#FF6B6B"],[4,3,2,"#4ECDC4"],[5,2,3,"#45B7D1"]],frets:[-1,-1,0,2,3,2],open:[false,false,true,false,false,false],muted:[0,1]},
    {label:"Barre (5th fret)",fingers:[[1,5,1,"#FF6B6B"],[2,7,3,"#4ECDC4"],[3,7,4,"#45B7D1"],[4,7,2,"#FFE66D"],[5,5,1,"#FF6B6B"]],frets:[-1,5,7,7,7,5],open:[],muted:[0],barFret:5,barStrings:[1,5]}
  ],
  "G Major":[
    {label:"Open (Standard)",fingers:[[0,3,2,"#FF6B6B"],[1,2,1,"#4ECDC4"],[5,3,3,"#45B7D1"]],frets:[3,2,0,0,0,3],open:[false,false,true,true,true,false],muted:[]},
    {label:"Barre (3rd fret)",fingers:[[0,3,1,"#FF6B6B"],[1,3,1,"#FF6B6B"],[2,5,3,"#4ECDC4"],[3,5,4,"#45B7D1"],[4,5,2,"#FFE66D"],[5,3,1,"#FF6B6B"]],frets:[3,3,5,5,5,3],open:[],muted:[],barFret:3,barStrings:[0,5]}
  ],
  "C Major":[
    {label:"Open (Standard)",fingers:[[1,3,3,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,1,1,"#45B7D1"]],frets:[-1,3,2,0,1,0],open:[false,false,false,true,false,true],muted:[0]},
    {label:"Barre (3rd fret)",fingers:[[1,3,1,"#FF6B6B"],[2,5,3,"#4ECDC4"],[3,5,4,"#45B7D1"],[4,5,2,"#FFE66D"],[5,3,1,"#FF6B6B"]],frets:[-1,3,5,5,5,3],open:[],muted:[0],barFret:3,barStrings:[1,5]}
  ],
  "E Minor":[
    {label:"Open (Standard)",fingers:[[0,2,2,"#FF6B6B"],[1,2,3,"#4ECDC4"]],frets:[0,2,2,0,0,0],open:[true,false,false,true,true,true],muted:[]},
    {label:"Barre (7th fret)",fingers:[[0,7,1,"#FF6B6B"],[1,7,1,"#FF6B6B"],[2,9,3,"#4ECDC4"],[3,9,4,"#45B7D1"],[4,8,2,"#FFE66D"],[5,7,1,"#FF6B6B"]],frets:[7,7,9,9,8,7],open:[],muted:[],barFret:7,barStrings:[0,5]}
  ],
  "A Minor":[
    {label:"Open (Standard)",fingers:[[1,1,1,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,2,3,"#45B7D1"]],frets:[-1,0,2,2,1,0],open:[false,true,false,false,false,true],muted:[0]},
    {label:"Barre (5th fret)",fingers:[[0,5,1,"#FF6B6B"],[1,5,1,"#FF6B6B"],[2,7,3,"#4ECDC4"],[3,7,4,"#45B7D1"],[4,6,2,"#FFE66D"],[5,5,1,"#FF6B6B"]],frets:[5,5,7,7,6,5],open:[],muted:[],barFret:5,barStrings:[0,5]}
  ],
  "D Minor":[
    {label:"Open (Standard)",fingers:[[3,1,1,"#FF6B6B"],[4,3,2,"#4ECDC4"],[5,2,3,"#45B7D1"]],frets:[-1,-1,0,2,3,1],open:[false,false,true,false,false,false],muted:[0,1]},
    {label:"Barre (5th fret)",fingers:[[1,5,1,"#FF6B6B"],[2,7,3,"#4ECDC4"],[3,7,4,"#45B7D1"],[4,6,2,"#FFE66D"],[5,5,1,"#FF6B6B"]],frets:[-1,5,7,7,6,5],open:[],muted:[0],barFret:5,barStrings:[1,5]}
  ],
  "F Major":[
    {label:"Partial Barre",fingers:[[0,1,1,"#FF6B6B"],[1,1,1,"#FF6B6B"],[2,2,2,"#4ECDC4"],[3,3,3,"#45B7D1"]],frets:[-1,-1,3,2,1,1],open:[],muted:[0,1],barFret:1,barStrings:[4,5]},
    {label:"Full Barre (1st fret)",fingers:[[0,1,1,"#FF6B6B"],[1,1,1,"#FF6B6B"],[2,3,3,"#4ECDC4"],[3,3,4,"#45B7D1"],[4,2,2,"#FFE66D"],[5,1,1,"#FF6B6B"]],frets:[1,1,3,3,2,1],open:[],muted:[],barFret:1,barStrings:[0,5]}
  ]
};

// ===== CHORD NAME MAP (shorthand → full name for import parsing) =====
var CHORD_NAME_MAP={
  "C":"C Major","Cm":"C Minor","C7":"C7","Cm7":"Cm7","Cmaj7":"Cmaj7","Cdim":"Cdim","Caug":"Caug","Csus2":"Csus2","Csus4":"Csus4","Cadd9":"Cadd9",
  "D":"D Major","Dm":"D Minor","D7":"D7","Dm7":"Dm7","Dmaj7":"Dmaj7","Ddim":"Ddim","Dsus2":"Dsus2","Dsus4":"Dsus4",
  "E":"E Major","Em":"E Minor","E7":"E7","Em7":"Em7","Emaj7":"Emaj7",
  "F":"F Major","Fm":"F Minor","F7":"F7","Fm7":"Fm7","Fmaj7":"Fmaj7",
  "G":"G Major","Gm":"G Minor","G7":"G7","Gm7":"Gm7","Gmaj7":"Gmaj7","Gsus4":"Gsus4",
  "A":"A Major","Am":"A Minor","A7":"A7","Am7":"Am7","Amaj7":"Amaj7","Asus2":"Asus2","Asus4":"Asus4",
  "B":"B Major","Bm":"B Minor","B7":"B7","Bm7":"Bm7",
  "C#":"C# Major","C#m":"C# Minor","Db":"Db Major","Dbm":"Db Minor",
  "D#":"D# Major","D#m":"D# Minor","Eb":"Eb Major","Ebm":"Eb Minor",
  "F#":"F# Major","F#m":"F# Minor","Gb":"Gb Major","Gbm":"Gb Minor",
  "G#":"G# Major","G#m":"G# Minor","Ab":"Ab Major","Abm":"Ab Minor",
  "A#":"A# Major","A#m":"A# Minor","Bb":"Bb Major","Bbm":"Bb Minor"
};

// ===== TRANSITION TIPS =====
var TRANSITION_TIPS={
  "E Major->A Major":"Slide your index finger from G string fret 1 to B string fret 2. Middle and ring fingers move as a pair.",
  "A Major->E Major":"Keep fingers close to fretboard. Move index to G string fret 1, shift the pair back.",
  "A Major->D Major":"Lift all fingers and reposition - practice the D shape claw separately.",
  "D Major->A Major":"Index finger drops from G string. Keep the motion small and deliberate.",
  "E Major->D Major":"Biggest jump at Level 1. Practice lifting and placing as one motion.",
  "D Major->E Major":"Reverse the big jump - land index finger first on G string fret 1.",
  "E Major->E7":"Simply lift your ring finger off the D string. One of the easiest changes!",
  "A Major->A7":"Lift your middle finger off the D string. Ring finger stays put.",
  "D Major->D7":"Middle finger moves from B string fret 3 to fret 1. Index and ring stay close.",
  "G Major->C Major":"Keep your ring finger anchored on A string fret 3 - it stays for both chords!",
  "C Major->G Major":"Ring finger is your anchor on A string fret 3. Pivot around it.",
  "G Major->D Major":"Ring finger moves from high E fret 3 to B string fret 3 - same fret, one string over.",
  "D Major->G Major":"Open up your hand shape - index goes to A string, pinky to high E fret 3.",
  "G Major->E Minor":"Simply lift your pinky and index finger. Middle and ring drop to A and D strings.",
  "E Minor->G Major":"Add index on A string fret 2, pinky on high E fret 3. Middle and ring slide over.",
  "C Major->A Minor":"Keep index finger on B string fret 1! Middle slides from D to G string. Ring lifts off.",
  "A Minor->C Major":"Index stays on B string fret 1 as anchor. Add ring finger to A string fret 3.",
  "E Minor->A Minor":"Index finger goes to B string fret 1. The two-finger shape shifts across one string.",
  "A Minor->E Minor":"Lift index from B string. Shift down to E minor shape. Quick change!",
  "E Minor->C Major":"Index to B fret 1, middle to D fret 2, ring to A fret 3 - build from the inside.",
  "C Major->E Minor":"Strip down to just middle and ring on A and D strings fret 2.",
  "D Major->E Minor":"Big shape change - go to the simple two-finger Em shape. Relax your hand.",
  "C Major->D Major":"Completely different shape. Lift all fingers and reposition above D-G-B strings.",
  "C Major->F Major":"Index finger becomes a mini barre. Keep middle and ring in similar position.",
  "A Minor->F Major":"Index becomes a barre across B and high E at fret 1. Middle to G fret 2, ring to D fret 3.",
  "F Major->C Major":"Release the barre. Ring stays around A string area. Reshape to open C.",
  "C Major->F Major":"Hardest beginner transition! Index barres fret 1, add middle and ring. Practice slowly.",
  "A Minor->D Minor":"Both minor chords - index moves from B fret 1 to G fret 1. Similar feeling shapes.",
  "E Minor->B7":"Add index to D fret 1, middle to A fret 2, ring to G fret 2. Build from the bottom.",
  "D Major->Bm":"Requires barre at fret 2. Plant the barre first, then add remaining fingers.",
  "G Major->D/F#":"Keep the G base, add index to grab the F# bass note on low E fret 2."
};

function getTransitionTip(from,to){
  var key=from+"->"+to;
  if(TRANSITION_TIPS[key])return TRANSITION_TIPS[key];
  var rev=to+"->"+from;
  if(TRANSITION_TIPS[rev])return "Reverse: "+TRANSITION_TIPS[rev];
  return null;
}

// ===== SCALES =====
var SCALES={
  "C":{major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],pentatonic:[0,2,4,7,9],minorPent:[0,3,5,7,10],blues:[0,3,5,6,7,10]},
  "D":{major:[2,4,6,7,9,11,1],minor:[2,4,5,7,9,10,0],pentatonic:[2,4,6,9,11],minorPent:[2,5,7,9,0],blues:[2,5,7,8,9,0]},
  "E":{major:[4,6,8,9,11,1,3],minor:[4,6,7,9,11,0,2],pentatonic:[4,6,8,11,1],minorPent:[4,7,9,11,2],blues:[4,7,9,10,11,2]},
  "F":{major:[5,7,9,10,0,2,4],minor:[5,7,8,10,0,1,3],pentatonic:[5,7,9,0,2],minorPent:[5,8,10,0,3],blues:[5,8,10,11,0,3]},
  "G":{major:[7,9,11,0,2,4,6],minor:[7,9,10,0,2,3,5],pentatonic:[7,9,11,2,4],minorPent:[7,10,0,2,5],blues:[7,10,0,1,2,5]},
  "A":{major:[9,11,1,2,4,6,8],minor:[9,11,0,2,4,5,7],pentatonic:[9,11,1,4,6],minorPent:[9,0,2,4,7],blues:[9,0,2,3,4,7]},
  "B":{major:[11,1,3,4,6,8,10],minor:[11,1,2,4,6,7,9],pentatonic:[11,1,3,6,8],minorPent:[11,2,4,6,9],blues:[11,2,4,5,6,9]}
};
var SCALE_NAMES={major:"Major",minor:"Natural Minor",pentatonic:"Major Pentatonic",minorPent:"Minor Pentatonic",blues:"Blues"};

function getScaleFrets(key,scaleType){
  var sc=SCALES[key];if(!sc||!sc[scaleType])return [];
  var intervals=sc[scaleType];
  var positions=[];
  var stringNotes=[4,9,2,7,11,4]; // E A D G B E as semitone indices
  for(var s=0;s<6;s++){
    for(var f=0;f<=12;f++){
      var noteIdx=(stringNotes[s]+f)%12;
      if(intervals.indexOf(noteIdx)!==-1){
        positions.push({string:s,fret:f,note:NOTE_NAMES[noteIdx],isRoot:noteIdx===intervals[0]});
      }
    }
  }
  return positions;
}

// ===== MICRO-ACHIEVEMENTS =====
var MICRO_ACHIEVEMENTS=[
  {id:"halfway",trigger:"sessionTime",val:60,msg:"Halfway there!",icon:"&#128170;"},
  {id:"clean_switch",trigger:"drillSwitch",val:1,msg:"Smooth switch!",icon:"&#9889;"},
  {id:"three_switches",trigger:"drillSwitch",val:3,msg:"On fire!",icon:"&#128293;"},
  {id:"full_song",trigger:"songComplete",val:1,msg:"Rockstar!",icon:"&#127908;"},
  {id:"quiz_streak",trigger:"quizStreak",val:3,msg:"Hat trick!",icon:"&#127913;"}
];

// ===== COMMON PROGRESSIONS =====
var COMMON_PROGRESSIONS=[
  {name:"I-IV-V (Blues)",chords:["E Major","A Major","B7"],key:"E"},
  {name:"I-V-vi-IV (Pop)",chords:["G Major","D Major","E Minor","C Major"],key:"G"},
  {name:"I-vi-IV-V (50s)",chords:["C Major","A Minor","F Major","G Major"],key:"C"},
  {name:"ii-V-I (Jazz)",chords:["D Minor","G7","C Major"],key:"C"},
  {name:"I-IV (Folk)",chords:["A Major","D Major"],key:"A"},
  {name:"I-bVII-IV (Rock)",chords:["A Major","G Major","D Major"],key:"A"}
];
