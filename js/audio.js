// ===== AUDIO =====
var AC=window.AudioContext||window.webkitAudioContext||null;
var audioCtx=null;
var tunerR={stream:null,analyser:null,ctx:null,anim:null};
var chordR={stream:null,analyser:null,ctx:null,anim:null};

// Note frequencies (octave 4)
var NOTE_FREQ={
  "C":261.63,"C#":277.18,"D":293.66,"D#":311.13,"E":329.63,
  "F":349.23,"F#":369.99,"G":392.00,"G#":415.30,"A":440.00,
  "A#":466.16,"B":493.88
};

// Guitar string open note octaves for chord voicing
var GUITAR_STRING_NOTES=[
  {note:"E",octave:2},{note:"A",octave:2},{note:"D",octave:3},
  {note:"G",octave:3},{note:"B",octave:3},{note:"E",octave:4}
];

function snd(type){
  if(!S.soundOn)return;
  try{
    if(!audioCtx&&AC)audioCtx=new AC();
    if(!audioCtx)return;
    if(audioCtx.state==="suspended")audioCtx.resume();
    var o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);
    var fr={start:523,complete:659,tick:880,badge:784,click:1200,levelup:440,correct:880,wrong:220};
    o.frequency.value=fr[type]||440;
    g.gain.value=(type==="tick"||type==="click")?0.05:0.12;
    o.type=(type==="badge"||type==="levelup")?"triangle":type==="wrong"?"sawtooth":"sine";
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+((type==="complete"||type==="levelup")?0.6:0.15));
    o.stop(audioCtx.currentTime+0.7);
  }catch(e){}
}

// ===== STRUM TONES =====
var STRUM_TONES={
  classic:{type:"triangle",gain:0.18,attack:0.01,decay:2.5,stagger:0.025},
  nylon:{type:"sine",gain:0.20,attack:0.02,decay:3.0,stagger:0.030},
  steel:{type:"sawtooth",gain:0.10,attack:0.005,decay:1.8,stagger:0.020},
  electric:{type:"square",gain:0.08,attack:0.003,decay:2.0,stagger:0.022,distortion:true}
};

function makeDistortionCurve(amount){
  var k=typeof amount==="number"?amount:50;
  var n=44100,curve=new Float32Array(n);
  for(var i=0;i<n;i++){
    var x=i*2/n-1;
    curve[i]=(3+k)*x*20*(Math.PI/180)/(Math.PI+k*Math.abs(x));
  }
  return curve;
}

// ===== CHORD SOUND PREVIEW =====
function strumChord(chordName){
  try{
    if(!audioCtx&&AC)audioCtx=new AC();
    if(!audioCtx)return;
    if(audioCtx.state==="suspended")audioCtx.resume();
    var notes=CHORD_NOTES[chordName];
    if(!notes||notes.length===0)return;
    sendMIDINotes(chordName);
    var tone=STRUM_TONES[S.strumTone]||STRUM_TONES.classic;
    var freqs=[];
    for(var i=0;i<notes.length;i++){
      var base=NOTE_FREQ[notes[i]];
      if(!base)continue;
      if(base>330)base/=2;
      if(base<80)base*=2;
      freqs.push(base);
    }
    var now=audioCtx.currentTime;
    var distNode=null;
    if(tone.distortion){
      distNode=audioCtx.createWaveShaper();
      distNode.curve=makeDistortionCurve(100);
      distNode.oversample="4x";
      distNode.connect(audioCtx.destination);
    }
    for(var i=0;i<freqs.length;i++){
      var o=audioCtx.createOscillator();
      var g=audioCtx.createGain();
      o.connect(g);g.connect(distNode||audioCtx.destination);
      o.frequency.value=freqs[i];
      o.type=tone.type;
      var startT=now+i*tone.stagger;
      g.gain.setValueAtTime(0,startT);
      g.gain.linearRampToValueAtTime(tone.gain,startT+tone.attack);
      g.gain.exponentialRampToValueAtTime(0.001,startT+tone.decay);
      o.start(startT);
      o.stop(startT+tone.decay+0.1);
    }
  }catch(e){}
}

// ===== METRONOME =====
function metroClick(accent){
  if(!S.soundOn)return;
  try{
    if(!audioCtx&&AC)audioCtx=new AC();
    if(!audioCtx)return;
    var o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);
    o.frequency.value=accent?1200:800;o.type="sine";
    g.gain.value=accent?0.18:0.10;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.06);
    o.stop(audioCtx.currentTime+0.08);
  }catch(e){}
}

function startMetronome(){
  S.metronomeOn=true;S._metroBeat=0;metroClick(true);render();
  var ms=60000/S.metronomeBpm;
  T.metro=setInterval(function(){
    S._metroBeat=(S._metroBeat+1)%S._metroBeats;
    metroClick(S._metroBeat===0);render();
  },ms);
}

function stopMetronome(){
  S.metronomeOn=false;clearInterval(T.metro);T.metro=null;render();
}

// ===== TUNER (YIN algorithm) =====
var _tunerPrevDetecting=false;
function autoCorrelate(buf,sr){
  var sz=buf.length,rms=0;
  for(var i=0;i<sz;i++)rms+=buf[i]*buf[i];
  rms=Math.sqrt(rms/sz);
  // Hysteresis: higher threshold to start, lower to continue
  var threshold=_tunerPrevDetecting?0.008:0.015;
  if(rms<threshold){_tunerPrevDetecting=false;return -1;}
  _tunerPrevDetecting=true;

  // YIN step 1: Difference function
  var halfSz=Math.floor(sz/2);
  var d=new Float32Array(halfSz);
  for(var tau=0;tau<halfSz;tau++){
    d[tau]=0;
    for(var j=0;j<halfSz;j++){
      var delta=buf[j]-buf[j+tau];
      d[tau]+=delta*delta;
    }
  }

  // YIN step 2: Cumulative mean normalized difference
  var dn=new Float32Array(halfSz);
  dn[0]=1;
  var runningSum=0;
  for(var tau=1;tau<halfSz;tau++){
    runningSum+=d[tau];
    dn[tau]=d[tau]*tau/runningSum;
  }

  // YIN step 3: Absolute threshold (find first tau below threshold)
  var yinThreshold=0.15;
  var tauEst=-1;
  // Min period: ~2000 Hz max; Max period: ~50 Hz min
  var minTau=Math.floor(sr/2000);
  var maxTau=Math.min(halfSz-1,Math.floor(sr/50));
  for(var tau=minTau;tau<maxTau;tau++){
    if(dn[tau]<yinThreshold){
      // Find the local minimum after dropping below threshold
      while(tau+1<maxTau&&dn[tau+1]<dn[tau])tau++;
      tauEst=tau;
      break;
    }
  }
  if(tauEst===-1){
    // Fallback: find global minimum in range
    var minVal=Infinity;
    for(var tau=minTau;tau<maxTau;tau++){
      if(dn[tau]<minVal){minVal=dn[tau];tauEst=tau;}
    }
    if(minVal>0.5)return -1; // Not confident enough
  }

  // YIN step 4: Parabolic interpolation
  if(tauEst>0&&tauEst<halfSz-1){
    var x1=dn[tauEst-1],x2=dn[tauEst],x3=dn[tauEst+1];
    var a=(x1+x3-2*x2)/2,b=(x3-x1)/2;
    if(a!==0){
      var shift=-b/(2*a);
      if(Math.abs(shift)<=1)tauEst+=shift;
    }
  }

  return sr/tauEst;
}

// ===== CHORD DETECTION =====
function getExpectedNotes(chordName){return CHORD_NOTES[chordName]||[];}

function detectFromFFT(analyser,sampleRate){
  var bufLen=analyser.frequencyBinCount;
  var dataArray=new Uint8Array(bufLen);
  analyser.getByteFrequencyData(dataArray);
  var nyquist=sampleRate/2,binSize=nyquist/bufLen;
  // Compute noise floor (average of all bins) and max
  var maxVal=0,sum=0;
  for(var i=0;i<bufLen;i++){if(dataArray[i]>maxVal)maxVal=dataArray[i];sum+=dataArray[i];}
  var noiseFloor=sum/bufLen;
  // Need strong signal above noise — reject if max is barely above ambient
  if(maxVal<100||maxVal-noiseFloor<50)return [];
  // Threshold: noise floor + fraction of dynamic range above noise
  var threshold=noiseFloor+(maxVal-noiseFloor)*0.55;
  var peaks=[];
  for(var i=4;i<bufLen-4;i++){
    var freq=i*binSize;
    if(freq<60||freq>2000)continue;
    // Wider peak check: local maximum within ±4 bins
    if(dataArray[i]<threshold)continue;
    var isPeak=true;
    for(var j=1;j<=4;j++){
      if(dataArray[i]<dataArray[i-j]||dataArray[i]<dataArray[i+j]){isPeak=false;break;}
    }
    if(isPeak)peaks.push({freq:freq,amp:dataArray[i]});
  }
  var notes={};
  for(var i=0;i<peaks.length;i++){
    var nn=12*Math.log2(peaks[i].freq/440),nr=Math.round(nn),idx=((nr%12)+12)%12;
    var name=NOTE_NAMES[(idx+9)%12];
    if(!notes[name]||peaks[i].amp>notes[name])notes[name]=peaks[i].amp;
  }
  return Object.keys(notes);
}

function startChordDetect(){
  if(!AC){S.chordDetectErr="Audio not supported";render();return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
    chordR.stream=st;
    var ctx=new AC(),src=ctx.createMediaStreamSource(st),an=ctx.createAnalyser();
    an.fftSize=8192;an.smoothingTimeConstant=0.4;src.connect(an);
    chordR.ctx=ctx;chordR.analyser=an;S.chordDetectOn=true;S.chordDetectErr=null;render();
    function det(){
      if(!S.chordDetectOn)return;
      var found=detectFromFFT(an,ctx.sampleRate);S.detectedNotes=found;
      var expected=getExpectedNotes(S.currentChord?S.currentChord.name:"");
      if(expected.length>0&&found.length>0){
        var hits=0;for(var i=0;i<expected.length;i++)if(found.indexOf(expected[i])!==-1)hits++;
        S.chordMatch=Math.round((hits/expected.length)*100);
      }else{S.chordMatch=-1;}
      // Update only the chord check section, not full DOM rebuild
      updateChordCheckUI();
      chordR.anim=requestAnimationFrame(det);
    }det();
  }).catch(function(){S.chordDetectErr="Microphone access denied";render();});
}

function stopChordDetect(){
  S.chordDetectOn=false;S.detectedNotes=[];S.chordMatch=-1;
  if(chordR.anim)cancelAnimationFrame(chordR.anim);
  if(chordR.stream)chordR.stream.getTracks().forEach(function(t){t.stop();});
  if(chordR.ctx)chordR.ctx.close();
  chordR={stream:null,analyser:null,ctx:null,anim:null};render();
}

// ===== AI COACH FEEDBACK =====
function getCoachFeedback(chordName,detectedNotes,expectedNotes){
  if(!expectedNotes||expectedNotes.length===0)return [];
  var tips=[];
  var missing=[];
  for(var i=0;i<expectedNotes.length;i++){
    if(detectedNotes.indexOf(expectedNotes[i])===-1)missing.push(expectedNotes[i]);
  }
  if(missing.length===0)return ["Great job! All notes are ringing clearly."];
  // Map notes to guitar strings for the current chord
  var chord=null;
  for(var i=0;i<ALL_CHORDS.length;i++)if(ALL_CHORDS[i].name===chordName){chord=ALL_CHORDS[i];break;}
  if(!chord)return [];
  for(var i=0;i<missing.length;i++){
    var note=missing[i];
    // Find which string plays this note
    var stringIdx=-1;
    for(var s=0;s<6;s++){
      if(chord.frets[s]>=0){
        var openNote=GUITAR_STRING_NOTES[s].note;
        var openIdx=NOTE_NAMES.indexOf(openNote);
        var frettedIdx=(openIdx+chord.frets[s])%12;
        if(NOTE_NAMES[frettedIdx]===note){stringIdx=s;break;}
      }
    }
    if(stringIdx>=0){
      if(chord.frets[stringIdx]===0){
        tips.push("The "+STRING_NAMES[stringIdx]+" string ("+note+") should ring open - check your fingers aren't touching it");
      }else{
        tips.push("Press harder on the "+STRING_NAMES[stringIdx]+" string, fret "+chord.frets[stringIdx]+" for the "+note+" note");
      }
    }else{
      tips.push("The "+note+" note is missing - check your finger positions");
    }
  }
  return tips.slice(0,3); // Max 3 tips
}

// ===== MIDI OUTPUT =====
var _midiAccess=null;

function initMIDI(){
  if(!navigator.requestMIDIAccess){S.midiEnabled=false;return;}
  navigator.requestMIDIAccess().then(function(access){
    _midiAccess=access;
    updateMIDIDevices();
    access.onstatechange=function(){updateMIDIDevices();render();};
    if(S.midiOutputId){
      var out=_midiAccess.outputs.get(S.midiOutputId);
      if(out)S.midiOutput=out;
    }
    if(!S.midiOutput){
      _midiAccess.outputs.forEach(function(port){
        if(!S.midiOutput)S.midiOutput=port;
      });
    }
    render();
  }).catch(function(){S.midiEnabled=false;render();});
}

function updateMIDIDevices(){
  S.midiDevices=[];
  if(!_midiAccess)return;
  _midiAccess.outputs.forEach(function(port){
    S.midiDevices.push({id:port.id,name:port.name||"MIDI Output"});
  });
}

function selectMIDIDevice(id){
  if(!_midiAccess)return;
  var out=_midiAccess.outputs.get(id);
  if(out){S.midiOutput=out;S.midiOutputId=id;saveState();}
  render();
}

function sendMIDINotes(chordName){
  if(!S.midiEnabled||!S.midiOutput)return;
  var notes=CHORD_NOTES[chordName];
  if(!notes||notes.length===0)return;
  var out=S.midiOutput;
  var midiNotes=[];
  for(var i=0;i<notes.length;i++){
    var noteIdx=NOTE_NAMES.indexOf(notes[i]);
    if(noteIdx===-1)continue;
    var midiNote=48+noteIdx;
    if(i===0)midiNotes.push(midiNote-12);
    midiNotes.push(midiNote);
  }
  for(var i=0;i<midiNotes.length;i++){
    out.send([0x90,midiNotes[i],80],performance.now()+i*25);
  }
  setTimeout(function(){
    if(!out)return;
    try{for(var i=0;i<midiNotes.length;i++)out.send([0x80,midiNotes[i],0]);}catch(e){}
  },500);
}

// ===== STEM PLAYBACK =====
var _stemAudios={};
var _stemTimeUpdater=null;
var STEM_NAMES=["vocals","drums","bass","guitar","piano","other"];
var STEM_COLORS={vocals:"#FF6B6B",drums:"#FFE66D",bass:"#4ECDC4",guitar:"#FF8A5C",piano:"#45B7D1",other:"#A78BFA"};
var STEM_ICONS={vocals:"&#127908;",drums:"&#129345;",bass:"&#127928;",guitar:"&#127930;",piano:"&#127929;",other:"&#127926;"};

function loadStemUrls(urlMap){
  cleanupStems();
  var keys=Object.keys(urlMap);
  var loaded=0;
  for(var i=0;i<keys.length;i++){
    var name=keys[i];
    var audio=new Audio();
    audio.preload="auto";
    audio.src=urlMap[name];
    audio.muted=!S.stemToggles[name];
    audio.volume=S.stemVolume;
    _stemAudios[name]=audio;
  }
  // Use first stem for duration/time tracking
  var first=_stemAudios[keys[0]];
  if(first){
    first.addEventListener("loadedmetadata",function(){
      S.stemDuration=first.duration;
      render();
    });
  }
}

function playStems(){
  var keys=Object.keys(_stemAudios);
  if(keys.length===0)return;
  for(var i=0;i<keys.length;i++){
    _stemAudios[keys[i]].play().catch(function(){});
  }
  S.stemPlaying=true;
  // Update time display
  clearInterval(_stemTimeUpdater);
  _stemTimeUpdater=setInterval(function(){
    var first=_stemAudios[Object.keys(_stemAudios)[0]];
    if(first){
      S.stemCurrentTime=first.currentTime;
      if(first.ended){
        S.stemPlaying=false;
        clearInterval(_stemTimeUpdater);
      }
      render();
    }
  },250);
  render();
}

function pauseStems(){
  var keys=Object.keys(_stemAudios);
  for(var i=0;i<keys.length;i++){
    _stemAudios[keys[i]].pause();
  }
  S.stemPlaying=false;
  clearInterval(_stemTimeUpdater);
  render();
}

function seekStems(time){
  var keys=Object.keys(_stemAudios);
  for(var i=0;i<keys.length;i++){
    _stemAudios[keys[i]].currentTime=time;
  }
  S.stemCurrentTime=time;
  render();
}

function setStemMuted(name,muted){
  if(_stemAudios[name]){
    _stemAudios[name].muted=muted;
  }
}

function setStemVolume(vol){
  var keys=Object.keys(_stemAudios);
  for(var i=0;i<keys.length;i++){
    _stemAudios[keys[i]].volume=vol;
  }
}

function cleanupStems(){
  var keys=Object.keys(_stemAudios);
  for(var i=0;i<keys.length;i++){
    try{_stemAudios[keys[i]].pause();_stemAudios[keys[i]].src="";}catch(e){}
  }
  _stemAudios={};
  clearInterval(_stemTimeUpdater);
  S.stemPlaying=false;
  S.stemCurrentTime=0;
  S.stemDuration=0;
}
