(function(){

  function launchPracticePlanItem(item){
    if(!item) return;

    if(item.type==="warmup" || item.type==="finger"){
      // Open finger exercise or generic warmup
      act("tab","practice");
      return;
    }

    if(item.type==="transition"){
      if(item.meta && item.meta.from && item.meta.to){
        act("startDrill", item.meta.from+","+item.meta.to);
      } else {
        act("tab","drill");
      }
      return;
    }

    if(item.type==="performance_song"){
      if(item.meta && item.meta.songId){
        // Find song index by songId
        for(var i=0;i<SONGS.length;i++){
          var sid = (SONGS[i].title||"").toLowerCase().replace(/\s+/g,"_");
          if(sid===item.meta.songId){
            act("openPerformSong", ""+i);
            return;
          }
        }
      }
      act("tab","songs");
      return;
    }

    if(item.type==="rhythm"){
      act("tab","rhythm");
      return;
    }

    // Fallback
    act("tab","practice");
  }

  window.launchPracticePlanItem = launchPracticePlanItem;

})();
