(function(){

  function selectWarmupItem(){
    if(typeof FINGER_EXERCISES!=="undefined" && FINGER_EXERCISES.length){
      var ex = FINGER_EXERCISES[Math.floor(Math.random()*FINGER_EXERCISES.length)];
      return { id:"warmup_"+ex.id, type:"warmup", label:ex.name, durationSec:120, meta:{ exerciseId:ex.id } };
    }
    return { id:"warmup_basic", type:"warmup", label:"Finger stretch warmup", durationSec:120, meta:{} };
  }

  function selectWeakTransition(){
    var ts = S.transitionStats || {};
    var worst = null, worstScore = -1;
    for(var key in ts){
      var row = ts[key];
      if(!row || !row.attempts) continue;
      var score = row.avgTime || 0;
      if(score > worstScore){ worstScore = score; worst = key; }
    }
    if(!worst) return null;
    var parts = worst.split("->");
    return { id:"transition_"+worst.replace(/[^a-zA-Z0-9]/g,"_"), type:"transition", label:parts[0]+" \u2192 "+parts[1]+" drill", durationSec:180, meta:{ from:parts[0], to:parts[1] } };
  }

  function selectWeakPerformanceTarget(){
    var perf = S.performanceStats || {};
    var worst = null, worstAcc = 101;
    for(var songId in perf){
      for(var arr in perf[songId]){
        for(var diff in perf[songId][arr]){
          var b = perf[songId][arr][diff];
          if(b && b.attempts>0 && !b.mastered && (b.bestAccuracy||0)<worstAcc){
            worstAcc = b.bestAccuracy||0;
            worst = { songId:songId, arrangementType:arr, difficultyId:diff, accuracy:worstAcc };
          }
        }
      }
    }
    if(!worst) return null;
    var title = worst.songId.replace(/_/g," ");
    return { id:"song_"+worst.songId, type:"performance_song", label:"Replay "+title+" ("+worst.accuracy+"%)", durationSec:0, meta:worst };
  }

  function selectRhythmItem(){
    var rr = S.rhythmResults;
    if(rr && typeof rr.accuracy==="number" && rr.accuracy < 80){
      return { id:"rhythm_repair", type:"rhythm", label:"Rhythm timing practice", durationSec:120, meta:{ bpm:S.bpm||80 } };
    }
    return null;
  }

  function selectFingerItem(){
    if(typeof FINGER_EXERCISES==="undefined") return null;
    var ex = FINGER_EXERCISES[Math.floor(Math.random()*FINGER_EXERCISES.length)];
    return { id:"finger_"+ex.id, type:"finger", label:ex.name, durationSec:ex.duration||60, meta:{ exerciseId:ex.id } };
  }

  window.selectWarmupItem = selectWarmupItem;
  window.selectWeakTransition = selectWeakTransition;
  window.selectWeakPerformanceTarget = selectWeakPerformanceTarget;
  window.selectRhythmItem = selectRhythmItem;
  window.selectFingerItem = selectFingerItem;

})();
