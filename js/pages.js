// ===== PAGE RENDERING =====

// Build chord check inner HTML (shared by sessionPage and updateChordCheckUI)
function _buildChordCheckInner(exp){
  // Note pills row — fixed height so layout doesn't jump
  var h='<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-bottom:10px;min-height:32px">';
  for(var i=0;i<exp.length;i++){
    var found=S.detectedNotes.indexOf(exp[i])!==-1;
    h+='<span class="note-pill" style="background:'+(found?"#4ECDC422":"var(--chip-bg)")+';color:'+(found?"#4ECDC4":"var(--text-muted)")+';border:2px solid '+(found?"#4ECDC4":"var(--border)")+'">'+(found?"&#9989;":"&#9675;")+' '+exp[i]+'</span>';
  }
  h+='</div>';
  // Match ring area — always same height to prevent layout shifts
  h+='<div style="text-align:center;min-height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center">';
  if(S.chordMatch>=0){
    var mc=S.chordMatch>=80?"#4ECDC4":S.chordMatch>=50?"#FFE66D":"#FF6B6B";
    var ml=S.chordMatch>=80?"Great!":S.chordMatch>=50?"Getting there...":"Keep trying!";
    h+=ringHTML(S.chordMatch,70,5,mc,'<div style="font-size:16px;font-weight:900;color:'+mc+'">'+S.chordMatch+'%</div>',"Chord match")+'<div style="font-size:12px;font-weight:700;color:'+mc+';margin-top:4px">'+ml+'</div>';
  }else{h+='<div style="color:var(--text-muted);font-size:13px">Strum the chord...</div>';}
  h+='</div>';
  // AI Coach feedback — fixed min height
  h+='<div style="min-height:20px">';
  var tips=getCoachFeedback(S.currentChord?S.currentChord.name:"",S.detectedNotes,exp);
  if(tips.length>0&&S.chordMatch>=0&&S.chordMatch<100){
    h+='<div style="margin-top:10px;background:var(--input-bg);border-radius:12px;padding:10px">';
    h+='<div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:6px">&#129302; Coach Tips:</div>';
    for(var i=0;i<tips.length;i++){
      h+='<div style="font-size:12px;color:var(--text-dim);margin-bottom:4px">&#8226; '+tips[i]+'</div>';
    }
    h+='</div>';
  }
  h+='</div>';
  return h;
}

// Update chord check results without full DOM rebuild
function updateChordCheckUI(){
  var el=document.getElementById("chord-check-results");
  if(!el||!S.chordDetectOn)return;
  var exp=getExpectedNotes(S.currentChord?S.currentChord.name:"");
  el.innerHTML=_buildChordCheckInner(exp);
}

// Targeted tuner UI update (avoids full DOM rebuild at ~30fps)
function updateTunerUI(){
  var noteEl=document.getElementById("tuner-note-display");
  var freqEl=document.getElementById("tuner-freq-display");
  var needleEl=document.getElementById("tuner-needle");
  var statusEl=document.getElementById("tuner-status");
  var stringsEl=document.getElementById("tuner-strings");
  if(!noteEl)return; // not on tuner tab

  var inT=Math.abs(S.tunerCents)<5;
  var tC=inT?"#4ECDC4":Math.abs(S.tunerCents)<15?"#FFE66D":"#FF6B6B";

  noteEl.textContent=S.tunerNote||"\u2014";
  noteEl.style.color=tC;
  freqEl.textContent=S.tunerFreq>0?S.tunerFreq+" Hz":"Play a note...";

  if(needleEl){
    needleEl.style.left=(50+S.tunerCents/2)+"%";
    needleEl.style.background=tC;
  }

  if(statusEl){
    if(!S.tunerFreq)statusEl.innerHTML="Listening...";
    else if(inT)statusEl.innerHTML="&#9989; In Tune!";
    else if(S.tunerCents>0)statusEl.innerHTML="&#8595; Too sharp (+"+S.tunerCents+"&#162;)";
    else statusEl.innerHTML="&#8593; Too flat ("+S.tunerCents+"&#162;)";
    statusEl.style.color=tC;
  }

  // Update string highlights
  if(stringsEl){
    var btns=stringsEl.children;
    for(var i=0;i<btns.length&&i<GUITAR_STRINGS.length;i++){
      var gs=GUITAR_STRINGS[i];
      var mt=S.tunerNote===gs.note;
      var sInT=mt&&Math.abs(S.tunerCents)<5;
      var sC=sInT?"#4ECDC4":mt&&Math.abs(S.tunerCents)<15?"#FFE66D":"#FF6B6B";
      btns[i].style.background=mt?sC+"22":"var(--chip-bg)";
      btns[i].style.borderColor=mt?sC:"var(--border)";
      btns[i].firstChild.style.color=mt?sC:"var(--text-muted)";
    }
  }
}

function homePage(){
  var h='<div class="tabs" role="tablist">';
  var allTabs=[[TAB.PRACTICE,"\uD83C\uDFB6"],[TAB.DRILL,"\u26A1"],[TAB.DAILY,"\uD83C\uDFC5"],[TAB.QUIZ,"\uD83E\uDDE0"],[TAB.EAR,"\uD83D\uDC42"],[TAB.STRUM,"\uD83C\uDFBC"],[TAB.SONGS,"\uD83C\uDFB5"],[TAB.RHYTHM,"\uD83E\uDD41"],[TAB.RUNNER,"\uD83C\uDFAE"],[TAB.BUILD,"\uD83D\uDD27"],[TAB.TUNER,"\uD83C\uDFA4"],[TAB.STATS,"\uD83D\uDCCA"],[TAB.GUIDE,"\uD83D\uDCD6"]];
  var focusTabs=[TAB.PRACTICE,TAB.DRILL,TAB.DAILY,TAB.STATS,TAB.GUIDE];
  var tabs=S.focusMode?allTabs.filter(function(t){return focusTabs.indexOf(t[0])!==-1;}):allTabs;
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i];
    h+='<button class="tab'+(S.tab===t[0]?" active":"")+'" onclick="act(\'tab\',\''+t[0]+'\')" role="tab" aria-selected="'+(S.tab===t[0])+'" aria-label="'+t[0].charAt(0).toUpperCase()+t[0].slice(1)+' tab"><span class="tab-icon">'+t[1]+'</span><span class="tab-label">'+t[0].charAt(0).toUpperCase()+t[0].slice(1)+'</span></button>';
  }
  h+='</div>';

  if(S.tab===TAB.PRACTICE) h+=practiceTab();
  else if(S.tab===TAB.DRILL) h+=drillTab();
  else if(S.tab===TAB.DAILY) h+=dailyTab();
  else if(S.tab===TAB.QUIZ) h+=quizTab();
  else if(S.tab===TAB.EAR) h+=earTrainTab();
  else if(S.tab===TAB.STRUM) h+=strumTab();
  else if(S.tab===TAB.SONGS) h+=songsTab();
  else if(S.tab===TAB.RHYTHM) h+=rhythmTab();
  else if(S.tab===TAB.RUNNER) h+=runnerTab();
  else if(S.tab===TAB.BUILD) h+=buildTab();
  else if(S.tab===TAB.TUNER) h+=tunerTab();
  else if(S.tab===TAB.STATS) h+=statsTab();
  else if(S.tab===TAB.GUIDE) h+=guideTab();
  return h;
}

// ===== PRACTICE TAB =====
function practiceTab(){
  // Daily goal progress at top
  var goalPct=Math.min(100,Math.round((S.todayPracticeSeconds/(S.dailyGoalMinutes*60))*100));
  var goalMins=Math.floor(S.todayPracticeSeconds/60);
  var h='<div class="card mb12"><div style="display:flex;align-items:center;gap:12px"><div class="flex-center">'+ringHTML(goalPct,56,5,S.goalReachedToday?"#4ECDC4":"#FF6B6B",'<div style="font-size:12px;font-weight:900;color:var(--text-primary)">'+goalMins+'m</div>',"Daily goal progress")+'</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text-primary)">'+(S.goalReachedToday?"&#9989; Goal reached!":"Daily Goal: "+S.dailyGoalMinutes+" min")+'</div><div style="font-size:11px;color:var(--text-muted)">'+goalMins+'/'+S.dailyGoalMinutes+' min today'+(S.goalStreak>0?" | &#128293; "+S.goalStreak+" day streak":"")+'</div></div><div style="display:flex;gap:4px">';
  var goals=[5,10,15,20,30];
  for(var i=0;i<goals.length;i++){
    h+='<button onclick="act(\'setGoal\',\''+goals[i]+'\')" style="width:28px;height:28px;border-radius:8px;font-size:11px;font-weight:700;background:'+(S.dailyGoalMinutes===goals[i]?"#4ECDC4":"var(--input-bg)")+';color:'+(S.dailyGoalMinutes===goals[i]?"#fff":"var(--text-muted)")+'">'+goals[i]+'</button>';
  }
  h+='</div></div></div>';

  // Quick Start / Resume
  h+='<div class="card mb12" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);border:none;text-align:center;padding:20px">';
  h+='<div style="font-size:28px;margin-bottom:4px">&#9889;</div>';
  if(S.lastChordName){
    h+='<div style="font-size:16px;font-weight:900;color:#fff">Pick Up Where You Left Off</div>';
    h+='<div style="font-size:12px;color:rgba(255,255,255,.85);margin:4px 0 12px">Continue practicing: <strong>'+escHTML(S.lastChordName)+'</strong></div>';
    h+='<div style="display:flex;gap:8px;justify-content:center">';
    h+='<button onclick="act(\'resumeSession\')" style="background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.6);border-radius:14px;padding:10px 24px;font-size:15px;font-weight:800;color:#fff;cursor:pointer">Continue</button>';
    h+='<button onclick="act(\'quickStart\')" style="background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.3);border-radius:14px;padding:10px 24px;font-size:15px;font-weight:800;color:rgba(255,255,255,.85);cursor:pointer">Random</button>';
    h+='</div>';
  } else {
    h+='<div style="font-size:16px;font-weight:900;color:#fff">Quick Start</div>';
    h+='<div style="font-size:12px;color:rgba(255,255,255,.85);margin:4px 0 12px">Jump right in &mdash; we\'ll pick a chord for you!</div>';
    h+='<button onclick="act(\'quickStart\')" style="background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.5);border-radius:14px;padding:10px 32px;font-size:16px;font-weight:800;color:#fff;cursor:pointer">Let\'s Go!</button>';
  }
  h+='</div>';

  h+='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Pick a Chord &#9889;</h2></div><div class="lvl-tabs">';
  for(var l=1;l<=3;l++){
    var sel=S.selectedLevel===l,lk=l>S.level;
    h+='<button class="lvl-tab" onclick="act(\'selLevel\',\''+l+'\')" style="background:'+(sel?LC[l]:"var(--tab-bg)")+';color:'+(sel?"#fff":"var(--tab-inactive)")+';opacity:'+(lk?0.4:1)+'" aria-label="Level '+l+' '+LN[l]+'">'+(lk?"&#128274; ":"Lvl "+l+" ")+LN[l]+'</button>';
  }
  h+='</div><div class="flex-col">';
  var cs=CHORDS[S.selectedLevel]||[];
  for(var i=0;i<cs.length;i++){
    var c=cs[i],p=S.chordProgress[c.name]||0,lk=S.selectedLevel>S.level;
    var tier=getChordTier(c.name);
    var tierStyle=tier.tier!=="none"?";border-left:4px solid "+tier.color:"";
    h+='<div class="card chord-card" style="opacity:'+(lk?0.5:1)+tierStyle+'"'+(lk?'':clickableDiv("act(\'startSession\',\'"+c.name+"\')"))+'>'+chordSVG(c,90)+'<div style="flex:1"><h3 style="margin:0;font-size:17px;font-weight:800;color:var(--text-primary)">'+c.name+tierBadgeHTML(c.name)+'</h3><div class="prog-bar"><div class="prog-fill" style="width:'+p+'%;background:linear-gradient(90deg,'+LC[S.selectedLevel]+','+LC[S.selectedLevel]+'88)"></div></div><div style="font-size:11px;color:var(--text-muted);margin-top:3px">'+(p>=100?"&#9989; Mastered":p>0?p+"%":"Not started")+'</div></div>';
    if(!lk)h+='<button onclick="event.stopPropagation();act(\'previewChord\',\''+c.name+'\')" style="background:none;font-size:18px;padding:6px" aria-label="Preview '+c.name+' sound">&#128264;</button><div style="font-size:22px;color:'+LC[S.selectedLevel]+'">&#9654;</div>';
    h+='</div>';
  }
  h+='</div>';

  // Progress summary
  var mas=0;for(var k in S.chordProgress)if(S.chordProgress[k]>=100)mas++;
  h+='<div class="card mt16"><h3 style="margin:0 0 10px;font-size:15px;font-weight:800;color:var(--text-primary)">&#128202; Progress</h3><div style="display:flex;justify-content:space-around;text-align:center"><div><div style="font-size:24px;font-weight:900;color:#FF6B6B">'+S.sessions+'</div><div style="font-size:10px;color:var(--text-muted)">Sessions</div></div><div><div style="font-size:24px;font-weight:900;color:#4ECDC4">'+mas+'</div><div style="font-size:10px;color:var(--text-muted)">Mastered</div></div><div><div style="font-size:24px;font-weight:900;color:#45B7D1">Lvl '+S.level+'</div><div style="font-size:10px;color:var(--text-muted)">Current</div></div></div></div>';

  // Custom Practice Sets
  h+=customSetsSection();

  // Badges
  h+='<div class="card" style="margin-top:12px"><h3 style="margin:0 0 10px;font-size:15px;font-weight:800;color:var(--text-primary)">&#127942; Badges</h3><div style="display:flex;flex-wrap:wrap;gap:8px">';
  for(var i=0;i<BADGES.length;i++){
    var b=BADGES[i],e=S.earnedBadges.indexOf(b.id)!==-1;
    h+='<div style="width:56px;text-align:center;opacity:'+(e?1:0.3)+'" aria-label="Badge: '+b.label+(e?" (earned)":" (locked)")+'"><div style="font-size:24px;filter:'+(e?"none":"grayscale(1)")+'">'+b.icon+'</div><div style="font-size:8px;color:var(--text-label);font-weight:600">'+b.label+'</div></div>';
  }
  h+='</div></div>';

  // Export/Import & Reset
  h+='<div style="text-align:center;margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
  h+='<button class="reset-btn" onclick="act(\'exportProgress\')" style="border-color:#4ECDC4;color:#4ECDC4">&#128190; Export</button>';
  h+='<button class="reset-btn" onclick="act(\'importProgress\')" style="border-color:#45B7D1;color:#45B7D1">&#128194; Import</button>';
  h+='<button class="reset-btn" onclick="resetProgress()">Reset Progress</button>';
  h+='</div>';
  if(S.importMsg)h+='<div style="text-align:center;margin-top:8px;font-size:12px;color:'+(S.importMsg.ok?"#4ECDC4":"#FF6B6B")+'">'+S.importMsg.text+'</div>';
  return h;
}

// ===== CUSTOM PRACTICE SETS =====
function customSetsSection(){
  var h='<div class="card" style="margin-top:12px"><h3 style="margin:0 0 10px;font-size:15px;font-weight:800;color:var(--text-primary)">&#127912; My Practice Sets</h3>';

  if(S.editingSet){
    h+='<input class="set-input mb12" id="set-name-input" type="text" placeholder="Set name..." value="'+escHTML(S.customSetName)+'" oninput="act(\'setName\',this.value)" aria-label="Practice set name"/>';
    h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Select chords (min 2):</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">';
    for(var l=1;l<=S.level;l++){
      var cs=CHORDS[l]||[];
      for(var i=0;i<cs.length;i++){
        var c=cs[i],sel=S.customSetChords.indexOf(c.name)!==-1;
        h+='<span class="chord-chip'+(sel?" selected":"")+'"'+clickableDiv("act(\'toggleSetChord\',\'"+c.name+"\')")+'>'+c.short+'</span>';
      }
    }
    h+='</div>';
    h+='<div style="display:flex;gap:8px"><button class="btn" onclick="act(\'saveSet\')" style="flex:1;padding:10px;font-size:14px;background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff'+(S.customSetChords.length<2||!S.customSetName.trim()?';opacity:0.5':'')+'">'+(S.editingSetIdx>=0?"Update":"Save")+'</button><button class="btn" onclick="act(\'cancelSet\')" style="flex:1;padding:10px;font-size:14px;background:var(--input-bg);color:var(--text-primary)">Cancel</button></div>';
  } else {
    if(S.customSets.length===0){
      h+='<p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Create custom chord groups to practice together.</p>';
    } else {
      for(var i=0;i<S.customSets.length;i++){
        var cs=S.customSets[i];
        h+='<div class="set-card mb12"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h4 style="margin:0;font-size:15px;font-weight:800;color:var(--text-primary)">'+escHTML(cs.name)+'</h4><div style="display:flex;gap:6px">';
        h+='<button onclick="act(\'drillCustomSet\',\''+i+'\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700" aria-label="Start drill with '+escHTML(cs.name)+'">&#9889; Drill</button>';
        h+='<button onclick="act(\'editSet\',\''+i+'\')" style="background:var(--input-bg);color:var(--text-muted);padding:6px 10px;border-radius:10px;font-size:12px;font-weight:700" aria-label="Edit set">&#9998;</button>';
        h+='<button onclick="act(\'deleteSet\',\''+i+'\')" style="background:var(--input-bg);color:#FF6B6B;padding:6px 10px;border-radius:10px;font-size:12px;font-weight:700" aria-label="Delete set">&#128465;</button>';
        h+='</div></div>';
        h+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
        for(var j=0;j<cs.chords.length;j++){
          h+='<span style="background:var(--chip-bg);padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700;color:var(--chip-color)">'+escHTML(cs.chords[j])+'</span>';
        }
        h+='</div></div>';
      }
    }
    h+='<button class="btn" onclick="act(\'newSet\')" style="width:100%;padding:10px;font-size:14px;background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff">+ Create Practice Set</button>';
  }
  h+='</div>';
  return h;
}

// escHTML() is defined in ui.js (loaded before pages.js)

// ===== DRILL TAB =====
function drillTab(){
  var h='<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Chord Switching &#9889;</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">60 seconds - switch fast!</p><div class="card"><div style="font-size:48px;margin-bottom:12px">&#127947;&#65039;</div><p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">Completed: <strong>'+S.drillCount+'</strong></p><button class="btn" onclick="act(\'startDrill\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">Start Drill</button></div>';
  // Suggested drill from transition stats
  var hardest=getHardestTransition();
  if(hardest){
    h+='<div class="card mt16"><h3 style="margin:0 0 8px;font-size:14px;font-weight:800;color:var(--text-primary)">&#128161; Suggested Drill</h3><p style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Your hardest transition: <strong>'+hardest.from+'</strong> &#8594; <strong>'+hardest.to+'</strong> (avg '+hardest.avg.toFixed(1)+'s)</p><button class="btn" onclick="act(\'drillTransition\',\''+hardest.from+'|'+hardest.to+'\')" style="padding:10px 20px;font-size:13px;background:linear-gradient(135deg,#FFE66D,#FF8A5C);color:var(--text-primary)">&#9889; Practice This</button></div>';
  }
  h+='</div>';
  return h;
}

function getHardestTransition(){
  var ts=S.transitionStats;
  var worst=null,worstAvg=0;
  for(var k in ts){
    if(ts[k].attempts>=2){
      var avg=ts[k].avgTime;
      if(avg>worstAvg){
        worstAvg=avg;
        var parts=k.split("->");
        worst={from:parts[0],to:parts[1],avg:avg};
      }
    }
  }
  return worst;
}

// ===== DAILY TAB =====
function dailyTab(){
  if(!S.dailyChallenge)return '';
  var dc=S.dailyChallenge;
  return '<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Daily Challenge &#127941;</h2><div class="card"><div style="font-size:48px;margin-bottom:8px">'+dc.icon+'</div><h3 style="margin:0 0 6px;font-size:18px;font-weight:800;color:var(--text-primary)">'+dc.title+'</h3><p style="color:var(--text-label);font-size:14px;margin-bottom:8px">'+dc.desc+'</p><div style="display:inline-block;background:#FFF3E0;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;color:#E65100;margin-bottom:16px">+'+dc.xp+' XP</div><br><button class="btn" onclick="act(\'startDaily\')" style="background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff">Accept Challenge</button></div></div>';
}

// ===== QUIZ TAB =====
function quizTab(){
  return '<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Chord Quiz &#129504;</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Name &#8594; pick the right diagram!</p><div class="card"><div style="font-size:48px;margin-bottom:12px">&#129504;</div><p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">Correct: <strong>'+S.quizCorrect+'</strong></p><button class="btn" onclick="act(\'startQuiz\')" style="background:linear-gradient(135deg,#45B7D1,#4ECDC4);color:#fff">Start Quiz</button></div></div>';
}

// ===== EAR TRAINING TAB =====
function earTrainTab(){
  if(S.earTrainQ)return earTrainPage();
  return '<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Ear Training &#128066;</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Listen to a chord, then identify it!</p><div class="card"><div style="font-size:48px;margin-bottom:12px">&#127911;</div><p style="color:var(--text-muted);font-size:13px;margin-bottom:8px">Score: <strong>'+S.earTrainScore+'</strong> correct all time</p><button class="btn" onclick="act(\'startEarTrain\')" style="background:linear-gradient(135deg,#FF6B6B,#4ECDC4);color:#fff">&#127911; Start Listening</button></div></div>';
}

function earTrainPage(){
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'tab\',\'ear\')">&#8592; Back</button>';
  h+='<div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px"><div style="background:#4ECDC422;padding:6px 14px;border-radius:14px"><span style="font-weight:700;color:#4ECDC4">'+S.earTrainScore+'/'+S.earTrainTotal+'</span></div><div style="background:#FF6B6B22;padding:6px 14px;border-radius:14px">&#128293;<span style="font-weight:700;color:#FF6B6B">'+S.earTrainStreak+'</span></div></div>';
  h+='<h2 style="font-size:22px;font-weight:900;color:var(--text-primary);margin:8px 0">What chord is this?</h2>';
  h+='<button class="btn mb16" onclick="act(\'replayEarTrain\')" style="padding:10px 20px;font-size:14px;background:linear-gradient(135deg,#FFE66D,#FF8A5C);color:var(--text-primary)">&#128264; Replay</button>';
  h+='<div style="display:flex;flex-direction:column;gap:8px;max-width:300px;margin:0 auto">';
  for(var i=0;i<S.earTrainOpts.length;i++){
    var opt=S.earTrainOpts[i];
    var isA=S.earTrainAns!==null;
    var isC=opt===S.earTrainQ;
    var isP=S.earTrainAns===opt;
    var bg=isA?(isC?"#4ECDC4":(isP?"#FF6B6B":"var(--input-bg)")):"var(--card-bg)";
    var clr=isA?(isC||isP?"#fff":"var(--text-muted)"):"var(--text-primary)";
    h+='<button class="btn" onclick="act(\'answerEarTrain\',\''+opt+'\')" style="width:100%;padding:14px;font-size:16px;font-weight:700;background:'+bg+';color:'+clr+';border:2px solid '+(isA?(isC?"#4ECDC4":(isP?"#FF6B6B":"var(--border)")):"var(--border)")+'">'+opt+'</button>';
  }
  h+='</div>';
  if(S.earTrainAns){
    var ok=S.earTrainAns===S.earTrainQ;
    h+='<div style="margin-top:16px;font-size:20px;font-weight:800;color:'+(ok?"#4ECDC4":"#FF6B6B")+';animation:bn .4s ease">'+(ok?"&#9989; Correct! +15 XP":"&#10060; It was "+S.earTrainQ)+'</div>';
  }
  h+='</div>';
  return h;
}

// ===== STRUM TAB =====
function strumTab(){
  var h='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Strum Patterns &#127932;</h2></div><div class="flex-col">';
  for(var i=0;i<STRUM_PATTERNS.length;i++){
    var sp=STRUM_PATTERNS[i],lk=sp.level>S.level;
    h+='<div class="card" style="opacity:'+(lk?0.4:1)+';cursor:'+(lk?"default":"pointer")+'"'+(lk?'':clickableDiv("act(\'openStrum\',\'"+sp.name+"\')"))+'">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center"><div><h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text-primary)">'+sp.name+'</h3><p style="margin:4px 0 0;font-size:12px;color:var(--text-dim)">'+sp.desc+'</p></div><div style="text-align:right"><div style="font-size:12px;font-weight:700;color:'+LC[sp.level]+'">Lvl '+sp.level+'</div><div style="font-size:11px;color:var(--text-muted)">'+sp.bpm+' BPM</div></div></div>';
    h+='<div style="display:flex;gap:4px;margin-top:10px">';
    for(var j=0;j<sp.pattern.length;j++){
      var p=sp.pattern[j],isD=p==="D",isU=p==="U";
      h+='<div style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:'+(isD?"#FF6B6B22":isU?"#4ECDC422":"var(--chip-bg)")+';font-size:14px;font-weight:700;color:'+(isD?"#FF6B6B":isU?"#4ECDC4":"var(--text-muted)")+'">'+(isD?"\u2193":isU?"\u2191":"\u00B7")+'</div>';
    }
    h+='</div></div>';
  }
  h+='</div>';
  return h;
}

// ===== SONGS TAB =====
function songsTab(){
  var h='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Song Library &#127925;</h2></div>';
  // Sub-tabs: Built-in | Community
  h+='<div class="community-tabs">';
  h+='<button class="community-tab'+(S.songsSubTab==="builtin"?" active":"")+'" onclick="act(\'songsSubTab\',\'builtin\')">&#127925; Built-in</button>';
  h+='<button class="community-tab'+(S.songsSubTab==="community"?" active":"")+'" onclick="act(\'songsSubTab\',\'community\')">&#127760; Community</button>';
  h+='<button class="community-tab'+(S.songsSubTab==="import"?" active":"")+'" onclick="act(\'songsSubTab\',\'import\')">&#128196; Import</button>';
  h+='<button class="community-tab'+(S.songsSubTab==="stems"?" active":"")+'" onclick="act(\'songsSubTab\',\'stems\')">&#127911; Stems</button>';
  h+='</div>';

  if(S.songsSubTab==="community") return h+communitySection();
  if(S.songsSubTab==="import") return h+importSection();
  if(S.songsSubTab==="stems") return h+stemsSection();

  h+='<div class="flex-col">';
  for(var i=0;i<SONGS.length;i++){
    var s=SONGS[i],lk=s.level>S.level;
    h+='<div class="card" style="opacity:'+(lk?0.4:1)+';cursor:'+(lk?"default":"pointer")+'"'+(lk?'':clickableDiv("act(\'openSong\',\'"+s.title.replace(/'/g,"\\'")+"\')"))+'">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center"><div><h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text-primary)">'+s.title+'</h3><p style="margin:2px 0 0;font-size:12px;color:var(--text-muted)">'+s.artist+'</p></div><div style="text-align:right"><div style="font-size:12px;font-weight:700;color:'+LC[s.level]+'">Lvl '+s.level+'</div><div style="font-size:11px;color:var(--text-muted)">'+s.bpm+' BPM</div></div></div>';
    h+='<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
    for(var j=0;j<s.chords.length;j++)
      h+='<span style="background:var(--chip-bg);padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700;color:var(--chip-color)">'+s.chords[j]+'</span>';
    h+='</div></div>';
  }
  h+='</div>';
  return h;
}

// ===== COMMUNITY SECTION =====
function communitySection(){
  var h='<div class="community-tabs" style="margin-bottom:12px">';
  h+='<button class="community-tab'+(S.communityTab==="browse"?" active":"")+'" onclick="act(\'communityTab\',\'browse\')">Browse</button>';
  h+='<button class="community-tab'+(S.communityTab==="submit"?" active":"")+'" onclick="act(\'communityTab\',\'submit\')">Submit</button>';
  h+='</div>';

  if(S.communityTab==="submit") return h+communitySubmitForm();

  // Browse
  h+='<div style="display:flex;gap:8px;margin-bottom:12px"><input class="set-input" style="flex:1" type="text" placeholder="Search songs..." value="'+escHTML(S.communitySearch)+'" oninput="act(\'communitySearch\',this.value)" aria-label="Search community songs"/>';
  h+='<button onclick="act(\'communitySort\',\''+(S.communitySort==="votes"?"newest":"votes")+'\')" style="padding:8px 12px;border-radius:10px;font-size:12px;font-weight:700;background:var(--input-bg);color:var(--text-muted)">'+(S.communitySort==="votes"?"&#11088; Top":"&#128337; New")+'</button></div>';

  if(S.communityLoading){
    h+='<div class="text-center" style="padding:30px;color:var(--text-muted)">Loading...</div>';
  } else if(S.communityError){
    h+='<div class="card text-center"><p style="color:#FF6B6B;font-size:13px">'+escHTML(S.communityError)+'</p><p style="color:var(--text-muted);font-size:12px;margin-top:8px">Make sure the community server is running:<br><code>cd server && npm start</code></p></div>';
  } else if(S.communitySongs.length===0){
    h+='<div class="card text-center"><p style="color:var(--text-muted);font-size:13px">No community songs yet. Be the first to submit!</p></div>';
  } else {
    h+='<div class="flex-col">';
    for(var i=0;i<S.communitySongs.length;i++){
      var cs=S.communitySongs[i];
      h+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><div><h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text-primary)">'+escHTML(cs.title)+'</h3><p style="margin:2px 0 0;font-size:12px;color:var(--text-muted)">'+escHTML(cs.artist)+' | '+cs.bpm+' BPM</p></div><div style="display:flex;gap:8px;align-items:center"><button class="vote-btn" onclick="act(\'voteSong\',\''+cs.id+'\')">&#9650; '+cs.votes+'</button></div></div>';
      var chords=[];try{chords=JSON.parse(cs.chords);}catch(e){}
      if(chords.length){
        h+='<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">';
        for(var j=0;j<chords.length;j++)h+='<span style="background:var(--chip-bg);padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700;color:var(--chip-color)">'+escHTML(chords[j])+'</span>';
        h+='</div>';
      }
      h+='<div style="margin-top:8px"><button class="btn" onclick="act(\'playCommunity\',\''+cs.id+'\')" style="padding:8px 16px;font-size:13px;background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">&#9654; Play</button></div>';
      h+='</div>';
    }
    h+='</div>';
  }
  return h;
}

function communitySubmitForm(){
  var ss=S.submitSong;
  var h='<div class="card"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">Submit a Song</h3>';
  h+='<input class="set-input mb12" type="text" placeholder="Song title" value="'+escHTML(ss.title)+'" oninput="act(\'submitField\',\'title:\'+this.value)" aria-label="Song title"/>';
  h+='<input class="set-input mb12" type="text" placeholder="Artist" value="'+escHTML(ss.artist)+'" oninput="act(\'submitField\',\'artist:\'+this.value)" aria-label="Artist name"/>';
  h+='<input class="set-input mb12" type="text" placeholder="Your name (optional)" value="'+escHTML(ss.submittedBy)+'" oninput="act(\'submitField\',\'submittedBy:\'+this.value)" aria-label="Your name"/>';
  h+='<div style="display:flex;gap:8px;margin-bottom:12px"><label style="font-size:12px;color:var(--text-muted);font-weight:600;display:flex;align-items:center;gap:4px">BPM:</label><input class="set-input" type="number" style="width:80px" value="'+ss.bpm+'" oninput="act(\'submitField\',\'bpm:\'+this.value)" aria-label="BPM" min="40" max="200"/></div>';
  h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">Chords used:</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">';
  for(var i=0;i<ALL_CHORDS.length;i++){
    var c=ALL_CHORDS[i],sel=ss.chords.indexOf(c.short)!==-1;
    h+='<span class="chord-chip'+(sel?" selected":"")+'"'+clickableDiv("act(\'submitToggleChord\',\'"+c.short+"\')")+'>'+c.short+'</span>';
  }
  h+='</div>';
  h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">Progression (click chords in order):</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;min-height:36px;background:var(--input-bg);border-radius:12px;padding:8px">';
  for(var i=0;i<ss.progression.length;i++){
    h+='<span style="background:var(--card-bg);padding:4px 10px;border-radius:8px;font-size:13px;font-weight:700;color:var(--text-primary)">'+ss.progression[i]+'</span>';
  }
  if(ss.progression.length===0)h+='<span style="color:var(--text-muted);font-size:12px">Click chords above to build progression...</span>';
  h+='</div>';
  if(ss.progression.length>0)h+='<button onclick="act(\'submitClearProg\')" style="font-size:11px;color:var(--text-muted);background:none;margin-bottom:12px">Clear progression</button>';
  var canSubmit=ss.title.trim()&&ss.artist.trim()&&ss.chords.length>=2&&ss.progression.length>=2;
  h+='<button class="btn" onclick="act(\'submitSong\')" style="width:100%;padding:12px;font-size:14px;background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff;opacity:'+(canSubmit?1:0.5)+'">Submit Song</button>';
  h+='</div>';
  return h;
}

// ===== RHYTHM GAME TAB =====
function rhythmTab(){
  if(S.rhythmResults)return rhythmResultsPage();
  if(S.rhythmActive)return rhythmGamePage();
  var h='<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Rhythm Game &#129345;</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Tap in time with the beat!</p>';
  h+='<div class="card"><div style="font-size:48px;margin-bottom:12px">&#127928;</div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px"><button onclick="act(\'rhythmBpm\',\''+(S.rhythmBpm-10)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)">-</button>';
  h+='<div style="text-align:center;min-width:60px"><div style="font-size:24px;font-weight:900;color:var(--text-primary)">'+S.rhythmBpm+'</div><div style="font-size:10px;color:var(--text-muted)">BPM</div></div>';
  h+='<button onclick="act(\'rhythmBpm\',\''+(S.rhythmBpm+10)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)">+</button></div>';
  h+='<button class="btn" onclick="act(\'startRhythm\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">&#9654; Start!</button>';
  h+='</div></div>';
  return h;
}

function rhythmGamePage(){
  var elapsed=Date.now()-S.rhythmStartTime;
  var h='<div class="text-center"><h2 style="font-size:18px;font-weight:900;color:var(--text-primary);margin:0 0 8px">&#129345; Tap on the beat!</h2>';
  h+='<div style="display:flex;justify-content:center;gap:20px;margin-bottom:12px">';
  h+='<div><div style="font-size:24px;font-weight:900;color:#FFE66D">'+S.rhythmScore+'</div><div style="font-size:10px;color:var(--text-muted)">Score</div></div>';
  h+='<div><div style="font-size:24px;font-weight:900;color:#FF6B6B">'+S.rhythmCombo+'x</div><div style="font-size:10px;color:var(--text-muted)">Combo</div></div></div>';

  // Lane visualization
  h+='<div class="rhythm-lane"><div class="rhythm-hit-zone"></div>';
  var laneW=400;
  for(var i=0;i<S.rhythmBeats.length;i++){
    var b=S.rhythmBeats[i];
    if(b.hit)continue; // Already hit
    var timeUntil=b.time-elapsed;
    var pct=40+(timeUntil/3000)*360; // 40px = hit zone, scrolls from right
    if(pct<-40||pct>laneW)continue;
    h+='<div class="rhythm-beat '+(b.type==="D"?"down":"up")+'" style="left:'+pct+'px">'+(b.type==="D"?"\u2193":"\u2191")+'</div>';
  }
  h+='</div>';

  h+='<button class="btn" onclick="act(\'rhythmTap\')" style="width:100%;padding:24px;font-size:20px;font-weight:900;background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;margin-top:8px">&#128308; TAP!</button>';
  h+='</div>';
  return h;
}

function rhythmResultsPage(){
  var r=S.rhythmResults;
  var h='<div class="text-center" style="padding-top:20px"><div style="font-size:56px;animation:bn .6s ease">&#129345;</div>';
  h+='<h2 style="font-size:26px;font-weight:900;color:var(--text-primary)">Results!</h2>';
  h+='<div class="card mb16" style="margin-top:12px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h+='<div><div style="font-size:32px;font-weight:900;color:#FFE66D">'+r.score+'</div><div style="font-size:11px;color:var(--text-muted)">Score</div></div>';
  h+='<div><div style="font-size:32px;font-weight:900;color:#4ECDC4">'+r.accuracy+'%</div><div style="font-size:11px;color:var(--text-muted)">Accuracy</div></div>';
  h+='<div><div style="font-size:32px;font-weight:900;color:#FF6B6B">'+r.maxCombo+'x</div><div style="font-size:11px;color:var(--text-muted)">Max Combo</div></div>';
  h+='</div></div>';
  h+='<div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="S.rhythmResults=null;act(\'startRhythm\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">Play Again</button>';
  h+='<button class="btn" onclick="S.rhythmResults=null;render()" style="background:#4ECDC4;color:#fff">&#127968; Back</button></div>';
  h+='</div>';
  return h;
}

// ===== CHORD RUNNER TAB =====
function runnerTab(){
  if(S.runnerResults)return runnerResultsPage();
  if(S.runnerActive)return runnerGamePage();
  var h='<div class="text-center"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Chord Runner &#127918;</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Strum the right chords as they scroll by!</p>';
  h+='<div class="card"><div style="font-size:48px;margin-bottom:12px">&#127928;</div>';
  h+='<div style="margin-bottom:16px;font-size:13px;color:var(--text-secondary);line-height:1.5">Chord names scroll across the screen.<br><strong>Strum</strong> when the <strong>target chord</strong> reaches you.<br>Let wrong chords pass! 3 lives.</div>';
  if(S.runnerHighScore>0)h+='<div style="margin-bottom:12px;font-size:15px;font-weight:800;color:#FFE66D">&#127942; High Score: '+S.runnerHighScore+'</div>';
  h+='<button class="btn" onclick="act(\'startRunner\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;font-size:18px;padding:16px 40px">&#9654; Start!</button>';
  h+='</div></div>';
  return h;
}

function runnerGamePage(){
  var h='<div>';
  // Lives, Score, Combo row
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:0 4px">';
  h+='<div style="font-size:18px;letter-spacing:2px">';
  for(var i=0;i<3;i++)h+=(i<S.runnerLives?'&#10084;&#65039;':'&#128420;');
  h+='</div>';
  h+='<div style="font-size:22px;font-weight:900;color:#FFE66D">'+S.runnerScore+'</div>';
  h+='<div style="font-size:16px;font-weight:800;color:'+(S.runnerCombo>=3?'#4ECDC4':'var(--text-muted)')+'">'+S.runnerCombo+'x</div>';
  h+='</div>';

  // Target chord card
  h+='<div class="card mb12" style="padding:10px 16px;display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(78,205,196,.12),rgba(69,183,209,.12));border:2px solid rgba(78,205,196,.3)">';
  if(S.runnerTarget){
    h+=chordSVG(S.runnerTarget,55);
    h+='<div style="flex:1"><div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Target Chord</div>';
    h+='<div style="font-size:22px;font-weight:900;color:var(--text-primary)">'+escHTML(S.runnerTarget.short)+'</div>';
    h+='<div style="font-size:11px;color:var(--text-muted)">'+escHTML(S.runnerTarget.name)+'</div></div>';
  }
  h+='</div>';

  // Scrolling lane
  h+='<div class="runner-lane">';
  h+='<div class="runner-ground"></div>';
  h+='<div class="runner-hit-zone"></div>';
  h+='<div class="runner-player" id="runner-player">&#127928;</div>';
  for(var i=0;i<S.runnerObstacles.length;i++){
    var o=S.runnerObstacles[i];
    if(o.x<-80||o.x>500)continue;
    var cls="runner-obstacle";
    if(o.result==="correct")cls+=" correct";
    else if(o.result==="wrong")cls+=" wrong";
    else if(o.result==="missed")cls+=" missed";
    else cls+=" normal";
    h+='<div class="'+cls+'" style="left:'+Math.round(o.x)+'px">'+escHTML(o.short)+'</div>';
  }
  // Scrolling ground dashes
  var offset=Math.round(S.runnerDistance%30);
  for(var i=-1;i<18;i++){
    var gx=i*30-offset;
    h+='<div style="position:absolute;bottom:10px;left:'+gx+'px;width:16px;height:2px;background:var(--text-muted);opacity:0.25;border-radius:1px"></div>';
  }
  h+='</div>';

  // Strum button
  h+='<button class="btn" onclick="act(\'runnerStrum\')" style="width:100%;padding:22px;font-size:20px;font-weight:900;background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;border-radius:16px;margin-top:4px;user-select:none;-webkit-user-select:none">&#127928; STRUM!</button>';
  h+='<div style="text-align:center;margin-top:6px;font-size:11px;color:var(--text-muted)">Press <strong>Space</strong> or tap to strum</div>';
  h+='</div>';
  return h;
}

function runnerResultsPage(){
  var r=S.runnerResults;
  var isHigh=r.score>=S.runnerHighScore&&r.score>0;
  var h='<div class="text-center" style="padding-top:20px"><div style="font-size:56px;animation:bn .6s ease">&#127918;</div>';
  h+='<h2 style="font-size:26px;font-weight:900;color:var(--text-primary)">Game Over!</h2>';
  if(isHigh)h+='<div style="font-size:16px;font-weight:800;color:#FFE66D;margin:8px 0;animation:bn .8s ease">&#127942; New High Score!</div>';
  h+='<div class="card mb16" style="margin-top:12px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h+='<div><div style="font-size:32px;font-weight:900;color:#FFE66D">'+r.score+'</div><div style="font-size:11px;color:var(--text-muted)">Score</div></div>';
  h+='<div><div style="font-size:32px;font-weight:900;color:#4ECDC4">'+r.maxCombo+'x</div><div style="font-size:11px;color:var(--text-muted)">Max Combo</div></div>';
  h+='<div><div style="font-size:32px;font-weight:900;color:#FF6B6B">'+r.distance+'m</div><div style="font-size:11px;color:var(--text-muted)">Distance</div></div>';
  h+='</div></div>';
  h+='<div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="S.runnerResults=null;act(\'startRunner\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">Play Again</button>';
  h+='<button class="btn" onclick="S.runnerResults=null;render()" style="background:#4ECDC4;color:#fff">&#127968; Back</button></div>';
  h+='</div>';
  return h;
}

// ===== BUILD (PROGRESSION BUILDER) TAB =====
function buildTab(){
  var h='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">Progression Builder &#128295;</h2><p style="color:var(--text-dim);font-size:13px">Build and play chord progressions</p></div>';

  // Progression display
  h+='<div class="prog-blocks mb12">';
  if(S.progChords.length===0){
    h+='<div style="color:var(--text-muted);font-size:13px;padding:12px">Add chords to build a progression...</div>';
  } else {
    for(var i=0;i<S.progChords.length;i++){
      var cn=S.progChords[i];
      var ch=null;for(var j=0;j<ALL_CHORDS.length;j++)if(ALL_CHORDS[j].name===cn)ch=ALL_CHORDS[j];
      var short=ch?ch.short:cn;
      h+='<div class="prog-block'+(S.progPlaying&&S.progBeat===i?" active":"")+'"><div class="del-btn" onclick="act(\'progRemove\',\''+i+'\')">&times;</div>';
      h+='<div class="chord-label">'+short+'</div>';
      h+='<div class="move-btns">';
      if(i>0)h+='<button onclick="act(\'progMove\',\''+i+':left\')">&#8592;</button>';
      if(i<S.progChords.length-1)h+='<button onclick="act(\'progMove\',\''+i+':right\')">&#8594;</button>';
      h+='</div></div>';
    }
  }
  h+='<div style="min-width:48px;display:flex;align-items:center;justify-content:center"><button onclick="act(\'progPickerToggle\')" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff;font-size:24px;font-weight:700">+</button></div>';
  h+='</div>';

  // Chord picker
  if(S.progPickerOpen){
    h+='<div class="card mb12"><h4 style="margin:0 0 8px;font-size:14px;font-weight:800;color:var(--text-primary)">Add Chord</h4><div class="chord-picker">';
    for(var l=1;l<=S.level;l++){
      var cs=CHORDS[l]||[];
      for(var i=0;i<cs.length;i++){
        h+='<button class="chord-pick-btn" onclick="act(\'progAdd\',\''+cs[i].name+'\')">'+cs[i].short+'</button>';
      }
    }
    h+='</div></div>';
  }

  // Templates
  h+='<div class="card mb12"><h4 style="margin:0 0 8px;font-size:14px;font-weight:800;color:var(--text-primary)">&#127932; Templates</h4><div style="display:flex;flex-wrap:wrap;gap:6px">';
  for(var i=0;i<COMMON_PROGRESSIONS.length;i++){
    var cp=COMMON_PROGRESSIONS[i];
    h+='<button class="chord-pick-btn" onclick="act(\'progTemplate\',\''+i+'\')">'+cp.name+' ('+cp.key+')</button>';
  }
  h+='</div></div>';

  // Scale Explorer
  if(S.progChords.length>0){
    // Detect key from first chord
    var firstChord=S.progChords[0];
    var scaleKey=null;
    for(var i=0;i<ALL_CHORDS.length;i++){
      if(ALL_CHORDS[i].name===firstChord||ALL_CHORDS[i].short===firstChord){
        var nm=ALL_CHORDS[i].name.replace(/ (Major|Minor)$/,"");
        if(nm.length<=2)scaleKey=nm;
        else scaleKey=nm.charAt(0);
        break;
      }
    }
    if(scaleKey&&SCALES[scaleKey]){
      h+='<div class="card mb12"><h4 style="margin:0 0 8px;font-size:14px;font-weight:800;color:var(--text-primary)">&#127926; Scale Explorer <span style="font-size:11px;color:var(--text-muted);font-weight:600">(Key of '+scaleKey+')</span></h4>';
      h+='<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;justify-content:center">';
      var scaleTypes=["pentatonic","major","minor","minorPent","blues"];
      for(var i=0;i<scaleTypes.length;i++){
        var st=scaleTypes[i],sel=S.selectedScale===st;
        h+='<button onclick="act(\'selectScale\',\''+st+'\')" style="padding:6px 12px;border-radius:10px;font-size:11px;font-weight:700;background:'+(sel?"#4ECDC4":"var(--input-bg)")+';color:'+(sel?"#fff":"var(--text-muted)")+';border:2px solid '+(sel?"#4ECDC4":"var(--border)")+';transition:all .2s">'+SCALE_NAMES[st]+'</button>';
      }
      h+='</div>';
      var positions=getScaleFrets(scaleKey,S.selectedScale);
      h+='<div class="flex-center">'+scaleSVG(positions,scaleKey,SCALE_NAMES[S.selectedScale])+'</div>';
      h+='</div>';
    }
  }

  // Current chord diagram when playing
  if(S.progPlaying&&S.progChords.length>0){
    var cn=S.progChords[S.progBeat];
    var ch=null;for(var i=0;i<ALL_CHORDS.length;i++)if(ALL_CHORDS[i].name===cn)ch=ALL_CHORDS[i];
    if(ch){
      h+='<div class="card mb12 text-center"><h4 style="margin:0 0 4px;font-size:14px;color:#FF6B6B">Now: '+ch.name+'</h4><div class="flex-center">'+chordSVG(ch,160)+'</div></div>';
    }
  }

  // Controls
  h+='<div class="card"><div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:12px">';
  h+='<button onclick="act(\'progBpm\',\''+(S.progBpm-5)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)">-</button>';
  h+='<div style="text-align:center;min-width:60px"><div style="font-size:20px;font-weight:900;color:var(--text-primary)">'+S.progBpm+'</div><div style="font-size:10px;color:var(--text-muted)">BPM</div></div>';
  h+='<button onclick="act(\'progBpm\',\''+(S.progBpm+5)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)">+</button></div>';
  var canPlay=S.progChords.length>=2;
  h+='<div style="display:flex;gap:10px;justify-content:center">';
  h+='<button class="btn" onclick="act(\'progPlay\')" style="background:'+(S.progPlaying?"#FFE66D":"linear-gradient(135deg,#FF6B6B,#FF8A5C)")+';color:'+(S.progPlaying?"var(--text-primary)":"#fff")+';opacity:'+(canPlay?1:0.5)+'">'+(S.progPlaying?"&#9632; Stop":"&#9654; Play")+'</button>';
  if(S.progChords.length>0)h+='<button class="btn" onclick="act(\'progClear\')" style="background:var(--input-bg);color:var(--text-muted)">Clear</button>';
  h+='</div></div>';
  return h;
}

// ===== TUNER TAB =====
function tunerTab(){
  var h='<div class="card"><div class="text-center"><h3 style="font-size:20px;font-weight:800;color:var(--text-primary);margin:0 0 8px">&#127925; Guitar Tuner</h3><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Standard tuning: E A D G B e</p>';
  h+='<div id="tuner-strings" style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  for(var i=0;i<GUITAR_STRINGS.length;i++){
    var gs=GUITAR_STRINGS[i],mt=S.tunerNote===gs.note,inT=mt&&Math.abs(S.tunerCents)<5,tC=inT?"#4ECDC4":mt&&Math.abs(S.tunerCents)<15?"#FFE66D":"#FF6B6B";
    h+='<div style="background:'+(mt?tC+"22":"var(--chip-bg)")+';border:2px solid '+(mt?tC:"var(--border)")+';border-radius:12px;padding:8px 14px;text-align:center;min-width:44px"><div style="font-size:18px;font-weight:800;color:'+(mt?tC:"var(--text-muted)")+'">'+gs.note+'</div><div style="font-size:9px;color:var(--text-muted)">'+gs.freq+'Hz</div></div>';
  }
  h+='</div>';
  if(S.tunerActive){
    var inT=Math.abs(S.tunerCents)<5,tC=inT?"#4ECDC4":Math.abs(S.tunerCents)<15?"#FFE66D":"#FF6B6B";
    h+='<div id="tuner-note-display" style="font-size:72px;font-weight:900;color:'+tC+';line-height:1">'+(S.tunerNote||"&#8212;")+'</div><div id="tuner-freq-display" style="font-size:16px;color:var(--text-muted);margin:4px 0 16px">'+(S.tunerFreq>0?S.tunerFreq+" Hz":"Play a note...")+'</div>';
    h+='<div style="position:relative;height:40px;background:var(--input-bg);border-radius:20px;margin:0 auto 16px;max-width:300px;overflow:hidden"><div style="position:absolute;left:50%;top:0;bottom:0;width:3px;background:var(--text-primary);z-index:2"></div><div id="tuner-needle" style="position:absolute;left:'+(50+S.tunerCents/2)+'%;top:4px;bottom:4px;width:12px;border-radius:6px;background:'+tC+';transition:left .15s;transform:translateX(-50%);z-index:3"></div><div style="position:absolute;top:50%;left:16px;transform:translateY(-50%);font-size:11px;color:var(--text-muted)">&#9837; flat</div><div style="position:absolute;top:50%;right:16px;transform:translateY(-50%);font-size:11px;color:var(--text-muted)">sharp &#9839;</div></div>';
    h+='<div id="tuner-status" style="font-size:14px;font-weight:700;color:'+tC+';margin-bottom:16px">';
    if(!S.tunerFreq)h+="Listening...";
    else if(inT)h+="&#9989; In Tune!";
    else if(S.tunerCents>0)h+="&#8595; Too sharp (+"+S.tunerCents+"&#162;)";
    else h+="&#8593; Too flat ("+S.tunerCents+"&#162;)";
    h+='</div><button class="btn" onclick="act(\'stopTuner\')" style="background:#FF6B6B;color:#fff">Stop Tuner</button>';
  } else {
    h+='<div style="font-size:64px;margin-bottom:12px;opacity:.3">&#127908;</div>';
    if(S.tunerErr)h+='<p style="color:#FF6B6B;font-size:13px;margin-bottom:12px">'+S.tunerErr+'</p>';
    h+='<button class="btn" onclick="act(\'startTuner\')" style="background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff">&#127908; Start Tuner</button>';
  }
  h+='</div></div>';
  return h;
}

// ===== STATS TAB =====
function statsTab(){
  var h='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">&#128202; Practice Stats</h2></div>';
  var hist=S.history||[];

  // Summary cards
  var totalXP=0,totalSessions=0,practiceDays={};
  for(var i=0;i<hist.length;i++){
    totalXP+=hist[i].xp||0;
    totalSessions++;
    practiceDays[hist[i].date]=true;
  }
  var dayCount=Object.keys(practiceDays).length;
  var avgXP=dayCount>0?Math.round(totalXP/dayCount):0;

  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">';
  h+='<div class="stat-card"><div style="font-size:28px;font-weight:900;color:#FF6B6B">'+S.xp+'</div><div style="font-size:11px;color:var(--text-muted);font-weight:600">Total XP</div></div>';
  h+='<div class="stat-card"><div style="font-size:28px;font-weight:900;color:#4ECDC4">'+totalSessions+'</div><div style="font-size:11px;color:var(--text-muted);font-weight:600">Activities</div></div>';
  h+='<div class="stat-card"><div style="font-size:28px;font-weight:900;color:#45B7D1">'+dayCount+'</div><div style="font-size:11px;color:var(--text-muted);font-weight:600">Practice Days</div></div>';
  h+='<div class="stat-card"><div style="font-size:28px;font-weight:900;color:#FFE66D">'+avgXP+'</div><div style="font-size:11px;color:var(--text-muted);font-weight:600">Avg XP/Day</div></div>';
  h+='</div>';

  // Mastery tiers summary
  var tiers={gold:0,silver:0,bronze:0};
  for(var i=0;i<ALL_CHORDS.length;i++){var ct=getChordTier(ALL_CHORDS[i].name);if(ct.tier!=="none")tiers[ct.tier]++;}
  if(tiers.gold+tiers.silver+tiers.bronze>0){
    h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#127942; Mastery Tiers</h3>';
    h+='<div style="display:flex;justify-content:space-around;text-align:center">';
    h+='<div><div style="font-size:24px">&#129351;</div><div style="font-size:20px;font-weight:900;color:#FFD700">'+tiers.gold+'</div><div style="font-size:10px;color:var(--text-muted)">Gold</div></div>';
    h+='<div><div style="font-size:24px">&#129352;</div><div style="font-size:20px;font-weight:900;color:#C0C0C0">'+tiers.silver+'</div><div style="font-size:10px;color:var(--text-muted)">Silver</div></div>';
    h+='<div><div style="font-size:24px">&#129353;</div><div style="font-size:20px;font-weight:900;color:#CD7F32">'+tiers.bronze+'</div><div style="font-size:10px;color:var(--text-muted)">Bronze</div></div>';
    h+='</div></div>';
  }

  // Activity calendar (last 30 days)
  h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#128197; Last 30 Days</h3>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">';
  var today=new Date();
  for(var d=29;d>=0;d--){
    var dt=new Date(today);dt.setDate(dt.getDate()-d);
    var ds=dt.toISOString().split("T")[0];
    var active=!!practiceDays[ds];
    var isToday=d===0;
    h+='<div class="cal-dot" title="'+ds+'" style="background:'+(active?"#4ECDC4":isToday?"var(--border)":"var(--input-bg)")+';border:'+(isToday?"2px solid var(--text-muted)":"2px solid transparent")+'" aria-label="'+ds+(active?" - practiced":"")+'"></div>';
  }
  h+='</div></div>';

  // XP last 7 days bar chart
  h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#9889; XP This Week</h3>';
  var dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var weekXP=[];var maxXP=1;
  for(var d=6;d>=0;d--){
    var dt=new Date(today);dt.setDate(dt.getDate()-d);
    var ds=dt.toISOString().split("T")[0];
    var dayXP=0;
    for(var i=0;i<hist.length;i++)if(hist[i].date===ds)dayXP+=hist[i].xp||0;
    weekXP.push({day:dayNames[dt.getDay()],xp:dayXP,date:ds});
    if(dayXP>maxXP)maxXP=dayXP;
  }
  h+='<div style="display:flex;align-items:flex-end;justify-content:space-around;height:100px;padding:0 8px">';
  for(var i=0;i<weekXP.length;i++){
    var pct=Math.round((weekXP[i].xp/maxXP)*80);
    var isToday=i===6;
    h+='<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px">';
    h+='<div style="font-size:10px;font-weight:700;color:var(--text-muted)">'+weekXP[i].xp+'</div>';
    h+='<div class="bar-segment" style="width:70%;height:'+Math.max(pct,3)+'%;background:'+(isToday?"#FF6B6B":"#4ECDC4")+'"></div>';
    h+='<div style="font-size:10px;font-weight:600;color:'+(isToday?"#FF6B6B":"var(--text-muted)")+'">'+weekXP[i].day+'</div>';
    h+='</div>';
  }
  h+='</div></div>';

  // Transition difficulty
  var ts=S.transitionStats;
  var transitions=[];
  for(var k in ts)if(ts[k].attempts>=2)transitions.push({key:k,avg:ts[k].avgTime,best:ts[k].best,attempts:ts[k].attempts});
  transitions.sort(function(a,b){return b.avg-a.avg;});
  if(transitions.length>0){
    h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#128260; Chord Transitions</h3>';
    for(var i=0;i<Math.min(transitions.length,5);i++){
      var t=transitions[i],parts=t.key.split("->");
      var clr=t.avg<2?"#4ECDC4":t.avg<3?"#FFE66D":"#FF6B6B";
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="min-width:120px;font-size:12px;font-weight:700;color:var(--text-primary)">'+parts[0]+' &#8594; '+parts[1]+'</div>';
      h+='<div style="flex:1;background:var(--prog-bg);border-radius:6px;height:8px;overflow:hidden"><div style="width:'+Math.min(100,t.avg*33)+'%;height:100%;background:'+clr+';border-radius:6px"></div></div>';
      h+='<div style="font-size:11px;font-weight:700;color:'+clr+';min-width:40px;text-align:right">'+t.avg.toFixed(1)+'s</div></div>';
    }
    h+='</div>';
  }

  // Most practiced chords
  h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#127928; Most Practiced</h3>';
  var chordCounts={};
  for(var i=0;i<hist.length;i++){
    if(hist[i].type==="session"||hist[i].type==="quiz"){
      var d=hist[i].detail;
      chordCounts[d]=(chordCounts[d]||0)+1;
    }
  }
  var sorted=[];
  for(var k in chordCounts)sorted.push({name:k,count:chordCounts[k]});
  sorted.sort(function(a,b){return b.count-a.count;});
  if(sorted.length===0){
    h+='<p style="font-size:13px;color:var(--text-muted)">No practice data yet. Start a session!</p>';
  } else {
    var topMax=sorted[0].count;
    for(var i=0;i<Math.min(sorted.length,5);i++){
      var pct=Math.round((sorted[i].count/topMax)*100);
      h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="min-width:90px;font-size:13px;font-weight:700;color:var(--text-primary)">'+sorted[i].name+tierBadgeHTML(sorted[i].name,14)+'</div><div style="flex:1;background:var(--prog-bg);border-radius:6px;height:8px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,#FF6B6B,#4ECDC4);border-radius:6px"></div></div><div style="font-size:12px;font-weight:700;color:var(--text-muted);min-width:24px;text-align:right">'+sorted[i].count+'</div></div>';
    }
  }
  h+='</div>';

  // Quiz accuracy
  if(S.quizCorrect>0||S.quizTotal>0){
    var qTotal=0,qCorrect=0;
    for(var i=0;i<hist.length;i++)if(hist[i].type==="quiz"){qTotal++;qCorrect++;}
    var acc=qTotal>0?Math.round((qCorrect/qTotal)*100):0;
    h+='<div class="card mb16"><h3 style="margin:0 0 12px;font-size:15px;font-weight:800;color:var(--text-primary)">&#129504; Quiz Accuracy</h3>';
    h+='<div class="flex-center">'+ringHTML(acc,80,6,"#4ECDC4",'<div style="font-size:20px;font-weight:900;color:var(--text-primary)">'+acc+'%</div>',"Quiz accuracy")+'</div>';
    h+='<div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px">'+S.quizCorrect+' correct answers</div></div>';
  }

  return h;
}

// ===== GUIDE TAB =====
function guideTab(){
  var h='<div class="text-center mb16"><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">&#128214; How to Read Chord Charts</h2></div>';
  h+='<div class="card mb16"><div class="flex-center mb12">'+chordSVG(CHORDS[1][0],200)+'</div><div style="text-align:center;font-size:13px;color:var(--text-dim);font-weight:600">Example: E Major</div></div>';
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#127912; Chart Legend</h3>';
  h+='<div style="display:flex;flex-direction:column;gap:12px">';
  h+='<div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:36px;height:36px;border-radius:10px;background:var(--input-bg);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--text-muted)">|</div><div><div style="font-weight:700;color:var(--text-primary);font-size:14px">Vertical Lines = Strings</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">6 strings from left to right: E A D G B e (thickest to thinnest)</div></div></div>';
  h+='<div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:36px;height:36px;border-radius:10px;background:var(--input-bg);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--text-muted)">&mdash;</div><div><div style="font-weight:700;color:var(--text-primary);font-size:14px">Horizontal Lines = Frets</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">The thick bar at the top is the nut. Lines below are frets going down the neck.</div></div></div>';
  h+='<div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:36px;height:36px;border-radius:10px;background:#FF6B6B;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff">1</div><div><div style="font-weight:700;color:var(--text-primary);font-size:14px">Colored Dots = Finger Placement</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">Place your finger between the frets where the dot appears. The number tells you which finger to use.</div></div></div>';
  h+='<div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:36px;height:36px;border-radius:10px;background:var(--input-bg);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#FF6B6B">X</div><div><div style="font-weight:700;color:var(--text-primary);font-size:14px">X = Don\'t Play</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">This string should be muted or not strummed.</div></div></div>';
  h+='<div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center"><svg width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="#4ECDC4" stroke-width="2.5"/></svg></div><div><div style="font-weight:700;color:var(--text-primary);font-size:14px">O = Play Open</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">Strum this string without pressing any fret.</div></div></div>';
  h+='</div></div>';
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#9995; Finger Numbers</h3>';
  h+='<div style="display:flex;justify-content:space-around;text-align:center">';
  h+='<div><div style="width:40px;height:40px;border-radius:50%;background:#FF6B6B;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;margin:0 auto 4px">1</div><div style="font-size:11px;color:var(--text-label);font-weight:600">Index</div></div>';
  h+='<div><div style="width:40px;height:40px;border-radius:50%;background:#4ECDC4;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;margin:0 auto 4px">2</div><div style="font-size:11px;color:var(--text-label);font-weight:600">Middle</div></div>';
  h+='<div><div style="width:40px;height:40px;border-radius:50%;background:#45B7D1;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;margin:0 auto 4px">3</div><div style="font-size:11px;color:var(--text-label);font-weight:600">Ring</div></div>';
  h+='<div><div style="width:40px;height:40px;border-radius:50%;background:#FFE66D;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:var(--text-primary);margin:0 auto 4px">4</div><div style="font-size:11px;color:var(--text-label);font-weight:600">Pinky</div></div>';
  h+='</div><p style="font-size:12px;color:var(--text-muted);margin-top:12px;text-align:center">Thumb stays behind the neck - it\'s never numbered on the chart.</p></div>';
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#127919; How to Practice</h3>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text-secondary);line-height:1.6">';
  h+='<div><span style="font-weight:700;color:#FF6B6B">1.</span> Pick a chord from the <strong>Practice</strong> tab and start a session.</div>';
  h+='<div><span style="font-weight:700;color:#FF6B6B">2.</span> Place your fingers exactly as shown in the chart.</div>';
  h+='<div><span style="font-weight:700;color:#FF6B6B">3.</span> Strum each string one at a time to check for buzzing.</div>';
  h+='<div><span style="font-weight:700;color:#FF6B6B">4.</span> Use the <strong>Metronome</strong> to keep time while you practice.</div>';
  h+='<div><span style="font-weight:700;color:#FF6B6B">5.</span> Use <strong>Chord Check</strong> to hear if your chord sounds right.</div>';
  h+='<div><span style="font-weight:700;color:#FF6B6B">6.</span> Try <strong>Drills</strong> to practice switching between chords quickly.</div>';
  h+='</div></div>';
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#128640; App Features</h3>';
  h+='<div style="display:flex;flex-direction:column;gap:10px">';
  var feats=[
    ["\uD83C\uDFB6","Practice","Timed sessions with chord diagrams, metronome, and mic feedback"],
    ["\u26A1","Drills","60-second speed drills switching between two chords"],
    ["\uD83C\uDFC5","Daily","A new challenge every day for bonus XP"],
    ["\uD83E\uDDE0","Quiz","Identify chords by their diagram to test your knowledge"],
    ["\uD83D\uDC42","Ear Training","Listen to a chord and identify it by ear"],
    ["\uD83C\uDFBC","Strum","Learn common strumming patterns with visual timing"],
    ["\uD83C\uDFB5","Songs","Play along with real songs using chord progressions"],
    ["\uD83E\uDD41","Rhythm","Tap-based rhythm game to improve your timing"],
    ["\uD83D\uDD27","Build","Create and play custom chord progressions"],
    ["\uD83C\uDFA4","Tuner","Tune your guitar with the built-in mic tuner"],
    ["\uD83D\uDCCA","Stats","Track your practice history and view analytics"]];
  for(var i=0;i<feats.length;i++)
    h+='<div style="display:flex;align-items:flex-start;gap:10px"><div style="font-size:18px;min-width:28px;text-align:center">'+feats[i][0]+'</div><div><div style="font-weight:700;color:var(--text-primary);font-size:13px">'+feats[i][1]+'</div><div style="font-size:12px;color:var(--text-dim)">'+feats[i][2]+'</div></div></div>';
  h+='</div></div>';
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 10px;font-size:16px;font-weight:800;color:var(--text-primary)">&#11088; Leveling Up</h3>';
  h+='<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">Master all chords at your current level to unlock the next. Each practice session builds your mastery percentage. Complete sessions, drills, and challenges to earn <strong>XP</strong> and <strong>badges</strong>. Keep a daily streak going for bonus rewards!</p></div>';
  // Focus Mode
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 8px;font-size:16px;font-weight:800;color:var(--text-primary)">&#128065; Focus Mode</h3>';
  h+='<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;line-height:1.5">Simplify the interface &mdash; show only core practice tabs to reduce distractions.</p>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:var(--text-primary)">Focus Mode</span>';
  h+='<button onclick="act(\'toggleFocus\')" style="padding:8px 20px;border-radius:10px;font-size:13px;font-weight:700;background:'+(S.focusMode?"#4ECDC4":"var(--input-bg)")+';color:'+(S.focusMode?"#fff":"var(--text-muted)")+';border:2px solid '+(S.focusMode?"#4ECDC4":"var(--border)")+';transition:all .2s">'+(S.focusMode?"&#9989; On":"Off")+'</button></div></div>';
  // MIDI Output
  h+='<div class="card mb16" style="text-align:left"><h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#127929; MIDI Output</h3>';
  h+='<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;line-height:1.5">Send chord notes to your DAW or virtual instrument via Web MIDI. Connect a MIDI device, enable below, then play any chord.</p>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:700;color:var(--text-primary)">Enable MIDI</span>';
  h+='<button onclick="act(\'toggleMidi\')" style="padding:8px 20px;border-radius:10px;font-size:13px;font-weight:700;background:'+(S.midiEnabled?"#4ECDC4":"var(--input-bg)")+';color:'+(S.midiEnabled?"#fff":"var(--text-muted)")+';border:2px solid '+(S.midiEnabled?"#4ECDC4":"var(--border)")+';transition:all .2s">'+(S.midiEnabled?"&#9989; On":"Off")+'</button></div>';
  if(S.midiEnabled){
    h+='<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">MIDI Devices:</div>';
    if(S.midiDevices.length===0){
      h+='<div style="font-size:12px;color:var(--text-muted);padding:10px;background:var(--input-bg);border-radius:10px;text-align:center">No MIDI output devices found. Connect a device and reload.</div>';
    } else {
      h+='<div style="display:flex;flex-direction:column;gap:6px">';
      for(var i=0;i<S.midiDevices.length;i++){
        var md=S.midiDevices[i],isActive=S.midiOutput&&S.midiOutputId===md.id;
        h+='<button onclick="act(\'selectMidiDevice\',\''+md.id+'\')" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;background:'+(isActive?"#4ECDC422":"var(--input-bg)")+';color:'+(isActive?"#4ECDC4":"var(--text-primary)")+';border:2px solid '+(isActive?"#4ECDC4":"var(--border)")+';text-align:left">'+(isActive?"&#9654; ":"&#9675; ")+escHTML(md.name)+'</button>';
      }
      h+='</div>';
    }
  }
  h+='</div>';

  h+='<div style="text-align:center;margin-top:16px;font-size:12px;color:var(--text-muted)">Press <strong>?</strong> for keyboard shortcuts</div>';
  return h;
}

// ===== SESSION PAGES =====
function sessionPage(){
  var c=S.currentChord;if(!c)return '';
  // Check if voicings are available
  var voicings=VOICINGS[c.name];
  var displayChord=c;
  if(voicings&&S.selectedVoicing>0&&S.selectedVoicing<voicings.length){
    displayChord=voicings[S.selectedVoicing];
  }
  var m=Math.floor(S.timer/60),s=S.timer%60;
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'back\')">&#8592; Back</button><h2 style="font-size:26px;font-weight:900;color:var(--text-primary);margin:8px 0">'+c.name+'</h2>';

  // Voicing selector
  if(voicings&&voicings.length>1){
    h+='<div class="voicing-tabs">';
    for(var i=0;i<voicings.length;i++){
      h+='<button class="voicing-tab'+(S.selectedVoicing===i?" active":"")+'" onclick="act(\'selectVoicing\',\''+i+'\')">'+voicings[i].label+'</button>';
    }
    h+='</div>';
  }

  h+='<div class="flex-center mb12">'+ringHTML((1-S.timer/120)*100,90,7,"#FF6B6B",'<div style="font-size:22px;font-weight:900;color:var(--text-primary)">'+m+':'+(s<10?'0':'')+s+'</div>',"Session timer")+'</div>';
  var chordKey=c.name+"_v"+S.selectedVoicing;
  var chordChanged=_prevChordKey!==chordKey;
  var morphClass=(chordChanged&&_prevChordKey)?" chord-morph":"";
  // Only animate on first appearance or chord/voicing change, not every timer tick
  var shouldAnimate=chordChanged;
  h+='<div class="card'+morphClass+'" style="display:inline-block;margin-bottom:12px">'+chordSVG(displayChord,220,c.name,shouldAnimate)+'</div>';
  _prevChordKey=chordKey;
  h+='<button onclick="act(\'previewChord\',\''+c.name+'\')" style="background:none;font-size:14px;color:var(--text-muted);margin-bottom:8px" aria-label="Preview chord sound">&#128264; Listen to this chord</button>';

  // Metronome card
  h+='<div class="card mb12"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><h4 style="margin:0;font-size:14px;color:var(--text-primary)">&#127924; Metronome</h4><button class="btn" onclick="act(\'toggleMetro\')" style="padding:8px 16px;font-size:13px;background:'+(S.metronomeOn?"#FFE66D":"linear-gradient(135deg,#4ECDC4,#45B7D1)")+';color:'+(S.metronomeOn?"var(--text-primary)":"#fff")+'">'+(S.metronomeOn?"&#9632; Stop":"&#9654; Start")+'</button></div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:12px"><button onclick="act(\'metroBpm\',\''+(S.metronomeBpm-5)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)" aria-label="Decrease BPM">-</button>';
  h+='<div style="text-align:center;min-width:60px"><div style="font-size:24px;font-weight:900;color:var(--text-primary)">'+S.metronomeBpm+'</div><div style="font-size:10px;color:var(--text-muted)">BPM</div></div>';
  h+='<button onclick="act(\'metroBpm\',\''+(S.metronomeBpm+5)+'\')" style="width:32px;height:32px;border-radius:50%;background:var(--input-bg);font-size:18px;font-weight:700;color:var(--text-secondary)" aria-label="Increase BPM">+</button></div>';
  if(S.metronomeOn){
    h+='<div style="display:flex;justify-content:center;gap:8px;margin-top:10px">';
    for(var i=0;i<S._metroBeats;i++)h+='<div class="metro-dot'+(i===S._metroBeat?" active":"")+'"></div>';
    h+='</div>';
  }
  h+='</div>';
  // Chord detection card — detection results update via direct DOM (see updateChordCheckUI)
  var exp=getExpectedNotes(c.name);
  h+='<div class="card mb16" style="min-height:80px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><h4 style="margin:0;font-size:14px;color:var(--text-primary)">&#127908; Chord Check</h4><button class="btn" id="chord-check-btn" onclick="act(\'toggleChordDetect\')" style="padding:8px 16px;font-size:13px;background:'+(S.chordDetectOn?"#FFE66D":"linear-gradient(135deg,#FF6B6B,#FF8A5C)")+';color:'+(S.chordDetectOn?"var(--text-primary)":"#fff")+'">'+(S.chordDetectOn?"&#9632; Stop":"&#127908; Listen")+'</button></div>';
  if(S.chordDetectErr)h+='<p style="color:#FF6B6B;font-size:12px;margin-bottom:8px">'+S.chordDetectErr+'</p>';
  h+='<div id="chord-check-results">';
  if(S.chordDetectOn){
    h+=_buildChordCheckInner(exp);
  }else{h+='<div style="text-align:center;color:var(--text-muted);font-size:12px">Enable mic to check your chord</div>';}
  h+='</div></div>';
  h+='<div class="card mb16" style="text-align:left"><h4 style="margin:0 0 6px;color:var(--text-primary);font-size:14px">&#128161; Tips</h4><p style="margin:0;font-size:13px;color:var(--text-label);line-height:1.5">Press firmly behind the fret. Strum each string to check for buzz. Keep your thumb relaxed!</p></div>';
  h+='<div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="act(\'toggleTimer\')" style="background:'+(S.timerActive?"#FFE66D":"#4ECDC4")+';color:'+(S.timerActive?"var(--text-primary)":"#fff")+'">'+(S.timerActive?"&#9208; Pause":"&#9654; Resume")+'</button><button class="btn" onclick="act(\'doneSession\')" style="background:#FF6B6B;color:#fff">&#10003; Done</button></div></div>';
  return h;
}

function completePage(){
  var n=S.currentChord?S.currentChord.name:"",p=S.chordProgress[n]||0;
  return '<div class="text-center" style="padding-top:30px"><div style="font-size:56px;margin-bottom:12px;animation:bn .6s ease">&#127881;</div><h2 style="font-size:26px;font-weight:900;color:var(--text-primary)">Awesome!</h2><p style="color:var(--text-dim);font-size:15px;margin-bottom:20px">You practiced <strong>'+n+'</strong></p><div class="card mb20"><div style="display:flex;justify-content:space-around;text-align:center"><div><div style="font-size:28px;font-weight:900;color:#FFE66D">+25</div><div style="font-size:11px;color:var(--text-muted)">XP</div></div><div><div style="font-size:28px;font-weight:900;color:#FF6B6B">&#128293;'+S.streak+'</div><div style="font-size:11px;color:var(--text-muted)">Streak</div></div><div><div style="font-size:28px;font-weight:900;color:#4ECDC4">'+p+'%</div><div style="font-size:11px;color:var(--text-muted)">Mastery</div></div></div></div><div class="flex-col"><button class="btn" onclick="act(\'startSession\',\''+n+'\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">&#128257; One More</button><button class="btn" onclick="act(\'tab\',\'practice\')" style="background:#4ECDC4;color:#fff">&#127968; Home</button></div></div>';
}

function drillPage(){
  if(S.drillChords.length<2)return '';
  var c=S.drillChords[S.drillIdx],nx=S.drillChords[(S.drillIdx+1)%2];
  var drillChanged=_prevChordKey!==c.name;
  var morphClass=(drillChanged&&_prevChordKey)?" chord-morph":"";
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'back\')">&#8592; Back</button>';
  h+='<h2 style="font-size:22px;font-weight:900;color:var(--text-primary);margin:8px 0">Switch Drill &#9889;</h2>';
  h+='<div style="display:flex;justify-content:center;gap:20px;align-items:center;margin-bottom:12px">'+ringHTML((1-S.drillTimer/60)*100,70,6,"#FF6B6B",'<div style="font-size:18px;font-weight:900;color:var(--text-primary)">'+S.drillTimer+'s</div>',"Drill timer");
  h+='<div><div style="font-size:32px;font-weight:900;color:#4ECDC4">'+S.drillSwitches+'</div><div style="font-size:11px;color:var(--text-muted)">switches</div></div></div>';
  h+='<div class="card'+morphClass+'" style="display:inline-block;margin-bottom:12px;border:3px solid '+LC[S.level]+'">';
  h+='<h3 style="margin:0 0 4px;font-size:16px;color:'+LC[S.level]+'">'+c.name+tierBadgeHTML(c.name,14)+'</h3>'+chordSVG(c,180,null,drillChanged)+'</div>';
  _prevChordKey=c.name;
  // Transition tip
  var tip=getTransitionTip(c.name,nx.name);
  if(tip){
    h+='<div style="background:var(--input-bg);border-radius:14px;padding:10px 14px;margin-bottom:10px;max-width:320px;display:inline-block;text-align:left">';
    h+='<div style="font-size:11px;font-weight:700;color:#4ECDC4;margin-bottom:4px">&#128161; Transition Tip</div>';
    h+='<div style="font-size:12px;color:var(--text-secondary);line-height:1.5">'+tip+'</div></div>';
  }
  h+='<div style="color:var(--text-muted);font-size:12px;margin-bottom:10px">Next: <strong>'+nx.name+tierBadgeHTML(nx.name,12)+'</strong></div>';
  h+='<button class="btn" onclick="act(\'drillSwitch\')" style="background:linear-gradient(135deg,#FFE66D,#FF8A5C);color:var(--text-primary);font-size:18px;padding:16px 44px">&#128260; Switched!</button></div>';
  return h;
}

function drillDonePage(){
  return '<div class="text-center" style="padding-top:30px"><div style="font-size:56px;animation:bn .6s ease">&#9889;</div><h2 style="font-size:26px;font-weight:900;color:var(--text-primary)">Drill Complete!</h2><p style="color:var(--text-dim);margin-bottom:20px"><strong>'+S.drillSwitches+'</strong> switches in 60s</p><button class="btn" onclick="act(\'startDrill\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">&#9889; Again</button> <button class="btn" onclick="act(\'tab\',\'drill\')" style="background:#4ECDC4;color:#fff;margin-left:10px">&#127968; Home</button></div>';
}

function dailyPage(){
  var dc=S.dailyChallenge;if(!dc)return '';
  var mx=dc.id==="hold"?30:dc.id==="marathon"?180:60;
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'back\')">&#8592; Back</button><div style="font-size:48px;margin-bottom:8px">'+dc.icon+'</div><h2 style="font-size:22px;font-weight:900;color:var(--text-primary)">'+dc.title+'</h2><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">'+dc.desc+'</p>';
  if(!S.dailyComplete)
    h+='<div class="flex-center">'+ringHTML((1-S.dailyTimer/mx)*100,100,7,"#FF6B6B",'<div style="font-size:28px;font-weight:900;color:var(--text-primary)">'+S.dailyTimer+'s</div>',"Daily challenge timer")+'</div><div style="margin-top:16px"><button class="btn" onclick="act(\'completeDaily\')" style="background:#FF6B6B;color:#fff">&#10003; Complete</button></div>';
  else
    h+='<div style="font-size:56px;animation:bn .6s ease">&#127941;</div><h3 style="color:#4ECDC4;font-size:20px;font-weight:800;margin:12px 0">Challenge Complete!</h3><div class="card" style="margin:16px 0"><div style="font-size:28px;font-weight:900;color:#FFE66D">+'+dc.xp+' XP</div></div><button class="btn" onclick="act(\'tab\',\'daily\')" style="background:#4ECDC4;color:#fff">&#127968; Home</button>';
  return h+'</div>';
}

function quizPage(){
  if(!S.quizQ)return '';
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'tab\',\'quiz\')">&#8592; Back</button><div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px"><div style="background:#4ECDC422;padding:6px 14px;border-radius:14px"><span style="font-weight:700;color:#4ECDC4">'+S.quizScore+'/'+S.quizTotal+'</span></div><div style="background:#FF6B6B22;padding:6px 14px;border-radius:14px">&#128293;<span style="font-weight:700;color:#FF6B6B">'+S.quizStreak+'</span></div></div>';
  h+='<h2 style="font-size:28px;font-weight:900;color:var(--text-primary);margin:8px 0 4px">Which is...</h2><div style="font-size:36px;font-weight:900;color:#FF6B6B;margin-bottom:16px">'+S.quizQ.name+'?</div>';
  h+='<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">';
  for(var i=0;i<S.quizOpts.length;i++){
    var c=S.quizOpts[i],isA=S.quizAns!==null,isC=c.name===S.quizQ.name,isP=S.quizAns===c.name;
    h+='<div class="card"'+clickableDiv("act(\'answerQuiz\',\'"+c.name+"\')")+' style="cursor:'+(isA?"default":"pointer")+';padding:10px;border:3px solid '+(isA?(isC?"#4ECDC4":(isP?"#FF6B6B":"var(--border)")):"var(--border)")+';background:'+(isA&&isC?"#4ECDC411":isA&&isP&&!isC?"#FF6B6B11":"var(--card-bg)")+';transition:all .2s;transform:'+(isA&&isC?"scale(1.05)":"scale(1)")+'">'+chordSVG(c,100)+'</div>';
  }
  h+='</div>';
  if(S.quizAns){
    var ok=S.quizAns===S.quizQ.name;
    h+='<div style="margin-top:16px;font-size:20px;font-weight:800;color:'+(ok?"#4ECDC4":"#FF6B6B")+';animation:bn .4s ease">'+(ok?"&#9989; Correct! +10 XP":"&#10060; Not quite!")+'</div>';
  }
  return h+'</div>';
}

function strumDetailPage(){
  var sp=S.selectedStrum;if(!sp)return '';
  var curBeat=S.strumActive?S._strumBeat:-1;
  var curDir=curBeat>=0?sp.pattern[curBeat]:"x";
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'back\')">&#8592; Back</button>';
  h+='<h2 style="font-size:24px;font-weight:900;color:var(--text-primary);margin:8px 0">'+sp.name+'</h2>';
  h+='<p style="color:var(--text-dim);font-size:13px;margin-bottom:8px">'+sp.desc+'</p>';
  h+='<div style="display:inline-block;background:#FFF3E0;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;color:#E65100;margin-bottom:20px">'+sp.bpm+' BPM</div>';
  // Strum hand animation
  h+='<div class="flex-center mb12">'+strumHandSVG(curDir,S.strumActive)+'</div>';
  h+='<div class="card mb20" style="padding:24px"><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">'+strumHTML(sp.pattern,curBeat)+'</div></div>';
  // Tone picker
  h+='<div class="card mb16"><h4 style="margin:0 0 8px;font-size:13px;font-weight:800;color:var(--text-primary)">&#127928; Strum Tone</h4><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">';
  var tones=["classic","nylon","steel","electric"];
  var toneLabels={"classic":"&#127928; Classic","nylon":"&#127931; Nylon","steel":"&#129529; Steel","electric":"&#9889; Electric"};
  for(var i=0;i<tones.length;i++){
    var t=tones[i],sel=S.strumTone===t;
    h+='<button onclick="act(\'setTone\',\''+t+'\')" style="padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;background:'+(sel?"#4ECDC4":"var(--input-bg)")+';color:'+(sel?"#fff":"var(--text-muted)")+';border:2px solid '+(sel?"#4ECDC4":"var(--border)")+';transition:all .2s">'+toneLabels[t]+'</button>';
  }
  h+='</div></div>';
  h+='<button class="btn" onclick="act(\'toggleStrum\')" style="background:'+(S.strumActive?"#FFE66D":"linear-gradient(135deg,#FF6B6B,#FF8A5C)")+';color:'+(S.strumActive?"var(--text-primary)":"#fff")+'">'+(S.strumActive?"&#9208; Stop":"&#9654; Play Pattern")+'</button></div>';
  return h;
}

function songDetailPage(){
  var sg=S.selectedSong;if(!sg)return '';
  var patBeat=S.songPlaying?(S.songBeat%sg.pattern.length):-1;
  var curDir=patBeat>=0?sg.pattern[patBeat]:"x";
  var h='<div class="text-center"><button class="back-btn" onclick="act(\'back\')">&#8592; Back</button><h2 style="font-size:22px;font-weight:900;color:var(--text-primary);margin:8px 0">'+escHTML(sg.title)+'</h2><p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">'+escHTML(sg.artist)+' &#8226; '+sg.bpm+' BPM</p>';
  h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">';
  for(var i=0;i<sg.chords.length;i++)
    h+='<span style="background:var(--chip-bg);padding:4px 12px;border-radius:10px;font-size:13px;font-weight:700;color:var(--chip-color)">'+escHTML(sg.chords[i])+'</span>';
  h+='</div>';
  h+='<div class="card mb16"><h4 style="margin:0 0 10px;font-size:14px;color:var(--text-primary)">Chord Progression</h4><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">';
  for(var i=0;i<sg.progression.length;i++){
    var c=sg.progression[i],isA=S.songPlaying&&i===S.songBeat;
    h+='<div style="width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:'+(isA?"#FF6B6B":"var(--chip-bg)")+';color:'+(isA?"#fff":"var(--chip-color)")+';font-size:16px;font-weight:800;border:2px solid '+(isA?"#FF6B6B":"var(--border)")+';transition:all .15s;transform:'+(isA?"scale(1.15)":"scale(1)")+'">'+escHTML(c)+'</div>';
  }
  h+='</div></div>';
  if(S.songPlaying){
    var cn=sg.progression[S.songBeat],ch=null;
    for(var i=0;i<ALL_CHORDS.length;i++)if(ALL_CHORDS[i].short===cn||ALL_CHORDS[i].name===cn)ch=ALL_CHORDS[i];
    if(ch)h+='<div class="card mb16"><h4 style="margin:0 0 4px;font-size:14px;color:#FF6B6B">Now: '+ch.name+'</h4><div class="flex-center">'+chordSVG(ch,160)+'</div></div>';
  }
  // Strum hand + pattern
  h+='<div class="card mb16" style="padding:16px"><h4 style="margin:0 0 8px;font-size:14px;color:var(--text-primary)">Strum Pattern</h4>';
  h+='<div class="flex-center mb12">'+strumHandSVG(curDir,S.songPlaying)+'</div>';
  h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">'+strumHTML(sg.pattern,patBeat)+'</div></div>';
  // Tone picker
  h+='<div class="card mb16"><h4 style="margin:0 0 8px;font-size:13px;font-weight:800;color:var(--text-primary)">&#127928; Strum Tone</h4><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">';
  var tones=["classic","nylon","steel","electric"];
  var toneLabels={"classic":"&#127928; Classic","nylon":"&#127931; Nylon","steel":"&#129529; Steel","electric":"&#9889; Electric"};
  for(var i=0;i<tones.length;i++){
    var t=tones[i],sel=S.strumTone===t;
    h+='<button onclick="act(\'setTone\',\''+t+'\')" style="padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;background:'+(sel?"#4ECDC4":"var(--input-bg)")+';color:'+(sel?"#fff":"var(--text-muted)")+';border:2px solid '+(sel?"#4ECDC4":"var(--border)")+';transition:all .2s">'+toneLabels[t]+'</button>';
  }
  h+='</div></div>';
  h+='<div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="act(\'toggleSong\')" style="background:'+(S.songPlaying?"#FFE66D":"linear-gradient(135deg,#FF6B6B,#FF8A5C)")+';color:'+(S.songPlaying?"var(--text-primary)":"#fff")+'">'+(S.songPlaying?"&#9208; Pause":"&#9654; Play Along")+'</button>';
  if(S.songPlaying)h+='<button class="btn" onclick="act(\'completeSong\')" style="background:#4ECDC4;color:#fff">&#10003; Done</button>';
  return h+'</div></div>';
}

function songDonePage(){
  var t=S.selectedSong?S.selectedSong.title:"";
  return '<div class="text-center" style="padding-top:30px"><div style="font-size:56px;animation:bn .6s ease">&#127925;</div><h2 style="font-size:26px;font-weight:900;color:var(--text-primary)">Song Complete!</h2><p style="color:var(--text-dim);margin-bottom:20px">You played <strong>'+t+'</strong></p><div class="card mb20"><div style="font-size:28px;font-weight:900;color:#FFE66D">+40 XP</div></div><button class="btn" onclick="act(\'tab\',\'songs\')" style="background:#4ECDC4;color:#fff">&#127968; Home</button></div>';
}

// ===== KEYBOARD SHORTCUT OVERLAY =====
function shortcutOverlay(){
  var shortcuts=[
    ["Space","Pause / Resume"],
    ["Enter","Confirm (drill switch)"],
    ["Escape","Go back"],
    ["?","Toggle this help"],
    ["Left/Right","BPM -/+5"],
    ["Up/Down","Change level"],
    ["M","Toggle metronome"],
    ["Shift+S","Toggle sound"],
    ["D","Toggle dark mode"],
    ["1-9","Quick tab switch"],
    ["0","Stats tab"]
  ];
  var h='<div class="shortcut-overlay" onclick="act(\'toggleShortcuts\')">';
  h+='<div class="shortcut-modal" onclick="event.stopPropagation()">';
  h+='<h3 style="margin:0 0 16px;font-size:18px;font-weight:800;color:var(--text-primary)">&#9000; Keyboard Shortcuts</h3>';
  for(var i=0;i<shortcuts.length;i++){
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">';
    h+='<kbd style="background:var(--input-bg);padding:3px 10px;border-radius:6px;font-size:13px;font-weight:700;font-family:monospace;color:var(--text-primary);border:1px solid var(--border)">'+shortcuts[i][0]+'</kbd>';
    h+='<span style="font-size:13px;color:var(--text-muted)">'+shortcuts[i][1]+'</span>';
    h+='</div>';
  }
  h+='<button class="btn" onclick="act(\'toggleShortcuts\')" style="margin-top:16px;width:100%;padding:10px;font-size:14px;background:var(--input-bg);color:var(--text-primary)">Close</button>';
  h+='</div></div>';
  return h;
}

// ===== IMPORT CHORD SHEET SECTION =====
function importSection(){
  var h='<div class="card mb16">';
  h+='<h3 style="margin:0 0 12px;font-size:16px;font-weight:800;color:var(--text-primary)">&#128196; Import Chord Sheet</h3>';
  h+='<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Paste a chord sheet using [Am] [G] bracket notation or chord names on their own lines.</p>';
  h+='<textarea class="import-textarea" id="import-textarea" rows="8" placeholder="[Am]   [G]   [C]   [F]\nVerse lyrics here...\n[Am]   [G]   [C]   [F]\nMore lyrics..." oninput="act(\'importText\',this.value)">'+escHTML(S.importText)+'</textarea>';
  h+='<button class="btn" onclick="act(\'parseImport\')" style="width:100%;padding:10px;font-size:14px;margin-top:10px;background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff">&#128270; Parse Chords</button>';
  h+='</div>';

  // Parse result
  if(S.importError){
    h+='<div class="card mb16"><p style="color:#FF6B6B;font-size:13px;margin:0">'+escHTML(S.importError)+'</p></div>';
  }
  if(S.importedSong){
    h+='<div class="card mb16">';
    h+='<h4 style="margin:0 0 10px;font-size:14px;font-weight:800;color:var(--text-primary)">&#9989; Parsed Successfully</h4>';
    h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--text-muted);font-weight:600">Title:</label><input class="set-input" type="text" value="'+escHTML(S.importedSong.title)+'" oninput="act(\'importTitle\',this.value)"/></div>';
    h+='<div style="margin-bottom:10px"><label style="font-size:12px;color:var(--text-muted);font-weight:600">Artist:</label><input class="set-input" type="text" value="'+escHTML(S.importedSong.artist)+'" oninput="act(\'importArtist\',this.value)"/></div>';
    h+='<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center"><label style="font-size:12px;color:var(--text-muted);font-weight:600">BPM:</label><input class="set-input" type="number" style="width:80px" value="'+S.importedSong.bpm+'" oninput="act(\'importBpm\',this.value)" min="40" max="200"/></div>';
    h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;font-weight:600">Chords found ('+S.importedSong.chords.length+'):</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">';
    for(var i=0;i<S.importedSong.chords.length;i++){
      var cn=S.importedSong.chords[i];
      var known=false;
      for(var j=0;j<ALL_CHORDS.length;j++)if(ALL_CHORDS[j].name===cn||ALL_CHORDS[j].short===cn){known=true;break;}
      h+='<span style="padding:4px 10px;border-radius:10px;font-size:12px;font-weight:700;background:'+(known?"#4ECDC422":"#FF6B6B22")+';color:'+(known?"#4ECDC4":"#FF6B6B")+';border:1px solid '+(known?"#4ECDC4":"#FF6B6B")+'">'+escHTML(cn)+'</span>';
    }
    h+='</div>';
    h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;font-weight:600">Progression ('+S.importedSong.progression.length+' chords):</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;background:var(--input-bg);border-radius:10px;padding:8px">';
    for(var i=0;i<Math.min(S.importedSong.progression.length,32);i++){
      h+='<span style="background:var(--card-bg);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:var(--text-primary)">'+escHTML(S.importedSong.progression[i])+'</span>';
    }
    if(S.importedSong.progression.length>32)h+='<span style="font-size:11px;color:var(--text-muted)">...+'+(S.importedSong.progression.length-32)+' more</span>';
    h+='</div>';
    h+='<button class="btn" onclick="act(\'saveImport\')" style="width:100%;padding:10px;font-size:14px;background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff">&#128190; Save as Song</button>';
    h+='</div>';
  }

  // Saved imported songs
  if(S.importedSongs.length>0){
    h+='<div class="card"><h4 style="margin:0 0 10px;font-size:14px;font-weight:800;color:var(--text-primary)">&#127925; My Imported Songs</h4>';
    h+='<div class="flex-col">';
    for(var i=0;i<S.importedSongs.length;i++){
      var sg=S.importedSongs[i];
      h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--input-bg);border-radius:12px">';
      h+='<div><div style="font-size:14px;font-weight:700;color:var(--text-primary)">'+escHTML(sg.title)+'</div>';
      h+='<div style="font-size:11px;color:var(--text-muted)">'+escHTML(sg.artist)+' | '+sg.chords.length+' chords | '+sg.bpm+' BPM</div></div>';
      h+='<div style="display:flex;gap:6px">';
      h+='<button onclick="act(\'playImport\',\''+i+'\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700">&#9654; Play</button>';
      h+='<button onclick="act(\'deleteImport\',\''+i+'\')" style="background:var(--input-bg);color:#FF6B6B;padding:6px 10px;border-radius:10px;font-size:12px;font-weight:700;border:1px solid var(--border)">&#128465;</button>';
      h+='</div></div>';
    }
    h+='</div></div>';
  }
  return h;
}

// ===== STEM SEPARATION SECTION =====
function stemsSection(){
  var h='<div class="card mb16" style="text-align:center">';
  h+='<div style="font-size:32px;margin-bottom:8px">&#127911;</div>';
  h+='<h3 style="margin:0 0 6px;font-size:18px;font-weight:900;color:var(--text-primary)">Stem Separator</h3>';
  h+='<p style="font-size:12px;color:var(--text-muted);margin:0 0 16px">Import a song to isolate vocals, drums, bass, guitar & piano</p>';

  if(!window.electron){
    h+='<p style="color:#FF6B6B;font-size:13px">Stem separation requires the desktop app (Electron).</p>';
    h+='</div>';
    return h;
  }

  // Import button
  if(S.stemStatus==="idle"||S.stemStatus==="error"||S.stemStatus==="ready"){
    h+='<button onclick="act(\'stemOpenFile\')" style="background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#fff;padding:12px 28px;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;border:none">&#128193; Import Audio File</button>';
  }
  h+='</div>';

  // Error
  if(S.stemError){
    h+='<div class="card mb16" style="border:1px solid #FF6B6B"><p style="color:#FF6B6B;font-size:13px;margin:0">'+escHTML(S.stemError)+'</p></div>';
  }

  // Separating progress
  if(S.stemStatus==="separating"){
    h+='<div class="card mb16">';
    h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">';
    h+='<div style="width:24px;height:24px;border:3px solid var(--border);border-top-color:#4ECDC4;border-radius:50%;animation:spin 1s linear infinite"></div>';
    h+='<div><div style="font-size:14px;font-weight:800;color:var(--text-primary)">Separating stems...</div>';
    h+='<div style="font-size:11px;color:var(--text-muted)">'+(S.stemFile?escHTML(S.stemFile.fileName):"")+'</div></div></div>';
    // Progress bar
    h+='<div style="background:var(--input-bg);border-radius:8px;height:8px;overflow:hidden;margin-bottom:8px">';
    h+='<div style="background:linear-gradient(90deg,#4ECDC4,#45B7D1);height:100%;border-radius:8px;width:'+S.stemProgress+'%;transition:width .3s ease"></div></div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:center">';
    h+='<span style="font-size:12px;color:var(--text-muted)">This may take 5-10 minutes</span>';
    h+='<button onclick="act(\'stemCancel\')" style="background:var(--input-bg);color:#FF6B6B;padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;border:1px solid var(--border);cursor:pointer">Cancel</button>';
    h+='</div></div>';
  }

  // Ready — show open player button
  if(S.stemStatus==="ready"&&S.stemPaths){
    h+='<div class="card mb16" style="background:linear-gradient(135deg,#4ECDC422,#45B7D122);border:1px solid #4ECDC4">';
    h+='<div style="display:flex;align-items:center;gap:12px">';
    h+='<div style="font-size:28px">&#9989;</div>';
    h+='<div style="flex:1"><div style="font-size:14px;font-weight:800;color:var(--text-primary)">Stems Ready!</div>';
    h+='<div style="font-size:11px;color:var(--text-muted)">'+(S.stemFile?escHTML(S.stemFile.fileName):"")+'</div></div>';
    h+='<button onclick="act(\'stemOpen\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;padding:10px 20px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;border:none">&#127911; Open Player</button>';
    h+='</div></div>';
  }

  // Info card
  h+='<div class="card" style="opacity:0.7">';
  h+='<div style="font-size:12px;color:var(--text-muted);line-height:1.6">';
  h+='<strong>How it works:</strong><br>';
  h+='1. Import an MP3, WAV, or FLAC file<br>';
  h+='2. AI separates it into 6 stems (vocals, drums, bass, guitar, piano, other)<br>';
  h+='3. Toggle stems on/off to play along without guitar, or solo parts to learn them<br>';
  h+='<br><strong>Note:</strong> First separation takes 5-10 minutes. Results are cached for instant replay.';
  h+='</div></div>';

  return h;
}

// ===== STEM PLAYER PAGE =====
function stemsPage(){
  var h='<div style="padding:8px 0">';
  // Header
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">';
  h+='<button onclick="act(\'stemBack\')" style="background:var(--input-bg);border:none;width:36px;height:36px;border-radius:12px;font-size:18px;cursor:pointer;color:var(--text-primary)">&#8592;</button>';
  h+='<div style="flex:1"><div style="font-size:16px;font-weight:900;color:var(--text-primary)">&#127911; Stem Player</div>';
  h+='<div style="font-size:11px;color:var(--text-muted)">'+(S.stemFile?escHTML(S.stemFile.fileName):"")+'</div></div></div>';

  // Stem toggles
  h+='<div class="card mb12">';
  for(var i=0;i<STEM_NAMES.length;i++){
    var name=STEM_NAMES[i];
    if(!S.stemPaths||!S.stemPaths[name])continue;
    var on=S.stemToggles[name];
    var color=STEM_COLORS[name];
    var icon=STEM_ICONS[name];
    h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;'+(i>0?"border-top:1px solid var(--border);":"")+'">';
    h+='<div style="display:flex;align-items:center;gap:10px">';
    h+='<span style="font-size:20px">'+icon+'</span>';
    h+='<span style="font-size:14px;font-weight:700;color:var(--text-primary)">'+name.charAt(0).toUpperCase()+name.slice(1)+'</span>';
    h+='</div>';
    h+='<button onclick="act(\'stemToggle\',\''+name+'\')" style="background:'+(on?color:"var(--input-bg)")+';color:'+(on?"#fff":"var(--text-muted)")+';padding:6px 16px;border-radius:10px;font-size:12px;font-weight:800;border:'+(on?"none":"1px solid var(--border)")+';cursor:pointer;min-width:60px">'+(on?"ON":"OFF")+'</button>';
    h+='</div>';
  }
  h+='</div>';

  // Playback controls
  h+='<div class="card mb12" style="text-align:center">';
  var cur=formatTime(S.stemCurrentTime);
  var dur=formatTime(S.stemDuration);
  h+='<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">'+cur+' / '+dur+'</div>';
  h+='<input type="range" min="0" max="'+(S.stemDuration||100)+'" step="0.5" value="'+S.stemCurrentTime+'" oninput="act(\'stemSeek\',this.value)" style="width:100%;margin-bottom:12px;accent-color:#4ECDC4"/>';
  h+='<button onclick="act(\'stemPlay\')" style="background:linear-gradient(135deg,#FF6B6B,#FF8A5C);color:#fff;padding:14px 40px;border-radius:16px;font-size:18px;font-weight:800;cursor:pointer;border:none">'+(S.stemPlaying?"&#9646;&#9646; Pause":"&#9654; Play")+'</button>';
  h+='</div>';

  // Volume
  h+='<div class="card">';
  h+='<div style="display:flex;align-items:center;gap:12px">';
  h+='<span style="font-size:16px">&#128266;</span>';
  h+='<input type="range" min="0" max="1" step="0.05" value="'+S.stemVolume+'" oninput="act(\'stemVolume\',this.value)" style="flex:1;accent-color:#4ECDC4"/>';
  h+='<span style="font-size:12px;color:var(--text-muted);font-weight:700;min-width:36px">'+Math.round(S.stemVolume*100)+'%</span>';
  h+='</div></div>';

  h+='</div>';
  return h;
}

function formatTime(s){
  if(!s||isNaN(s))return "0:00";
  var m=Math.floor(s/60);
  var sec=Math.floor(s%60);
  return m+":"+(sec<10?"0":"")+sec;
}
