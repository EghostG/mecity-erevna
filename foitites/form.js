/* MeCity AI · Έρευνα φοιτητών — φόρμα που συμπληρώνει μόνος του ο φοιτητής */
(function(){
  "use strict";
  var C = window.MECITY;
  var FUT = function(a){ return a.living==="parents"||a.living==="dorm"; };
  var YNM = [["yes","Ναι"],["maybe","Ίσως"],["no","Όχι"]];
  var STEPS = [
    {key:"_intro", type:"say", step:"MeCity AI", title:"Πώς ψάχνουν σπίτι οι φοιτητές;",
      say:"Ανώνυμη έρευνα 1 λεπτού. Δεν ζητάμε κανένα προσωπικό στοιχείο.", btn:"Ξεκίνα"},
    {key:"living", title:"Πού μένεις τώρα;",
      opts:[["rent_alone","Νοικιάζω μόνος/η"],["rent_shared","Νοικιάζω με συγκάτοικο"],["parents","Με τους γονείς μου"],["dorm","Σε εστία"]]},
    {key:"city", title:"Σε ποια πόλη σπουδάζεις;",
      opts:[["athens","Αθήνα"],["thessaloniki","Θεσσαλονίκη"],["patra","Πάτρα"],["heraklion","Ηράκλειο"],["other","Άλλη"]]},
    {key:"sources", type:"multi",
      title:function(a){ return FUT(a)?"Πού θα έψαχνες σπίτι;":"Πού έψαξες σπίτι;"; },
      hint:"Διάλεξε όσα ισχύουν.",
      opts:[["xe","xe.gr"],["spitogatos","Spitogatos"],["facebook","Facebook groups"],["agent","Μεσίτης"],["friends","Φίλοι / γνωστοί"]]},
    {key:"pain", type:"text",
      title:function(a){ return FUT(a)?"Τι σε φοβίζει πιο πολύ για όταν θα ψάξεις;":"Τι σε δυσκόλεψε πιο πολύ όταν έψαχνες;"; },
      hint:"Με δυο λόγια. Μπορείς να το προσπεράσεις."},
    {key:"scam", title:"Έπεσες ποτέ σε αγγελία που δεν ήταν αυτό που έλεγε;", skip:FUT,
      opts:[["different","Ναι, ήταν διαφορετική απ' ό,τι έδειχνε"],["scam","Ναι, ήταν απάτη (π.χ. ζήτησαν προκαταβολή χωρίς να το δω)"],["no","Όχι"]]},
    {key:"price", title:"Όταν πήρες τηλέφωνο για μια αγγελία, ήξερες αν το ενοίκιο ήταν λογικό για την περιοχή;", skip:FUT,
      opts:[["yes","Ναι"],["no","Όχι"],["nocall","Δεν πήρα ποτέ τηλέφωνο"]]},
    {key:"ai", title:"Έχεις ρωτήσει ποτέ ChatGPT ή άλλο AI για σπίτι ή ενοίκιο;", opts:[["yes","Ναι"],["no","Όχι"]]},
    {key:"budget", title:"Μέχρι πόσο ενοίκιο μπορείς να δώσεις;", hint:"Το δικό σου μερίδιο, τον μήνα.",
      opts:[["<300","Κάτω από 300€"],["300-400","300 – 400€"],["400-500","400 – 500€"],["500+","Πάνω από 500€"]]},
    {key:"_pitch", type:"say", step:"Τι φτιάχνουμε", title:"Ένα AI για να βρίσκεις σπίτι",
      say:"Γράφεις με δικά σου λόγια τι θες, π.χ. «δυάρι κοντά στη σχολή μέχρι 450€», και σου δείχνει μόνο όσα ταιριάζουν, μαζί με το αν η τιμή είναι δίκαιη.", btn:"Συνέχεια"},
    {key:"use", title:"Θα το χρησιμοποιούσες την επόμενη φορά που ψάχνεις σπίτι;", opts:YNM},
    {key:"trust", title:"Θα εμπιστευόσουν AI να σου πει αν ένα ενοίκιο είναι δίκαιο;", opts:YNM}
  ];
  var KEYS = ["living","city","sources","pain","scam","price","ai","budget","use","trust"];
  var $ = function(id){return document.getElementById(id);};
  var ans={}, i=0;
  var LS="mecity_foitites_pending_v1";
  function loadP(){ try{ return JSON.parse(localStorage.getItem(LS)||"[]"); }catch(e){ return []; } }
  function saveP(p){ try{ localStorage.setItem(LS, JSON.stringify(p)); }catch(e){} }
  var pending=loadP();

  function visible(k){ var s=STEPS[k]; return !(s.skip && s.skip(ans)); }
  function next(){ do{ i++; }while(i<STEPS.length && !visible(i)); if(i>=STEPS.length) finish(); else render(); }
  function prev(){ var j=i; do{ j--; }while(j>=0 && !visible(j)); if(j>=0){ i=j; render(); } }
  function btn(t,cls,fn){ var b=document.createElement("button"); b.type="button"; b.className="opt"+(cls?" "+cls:""); b.textContent=t; b.addEventListener("click",fn); return b; }
  function qNum(st){ var n=0; for(var k=0;k<STEPS.length;k++){ var s=STEPS[k]; if(s.key.charAt(0)==="_"||!visible(k)) continue; n++; if(s===st) return n; } return n; }
  function qTotal(){ var n=0; for(var k=0;k<STEPS.length;k++){ if(STEPS[k].key.charAt(0)!=="_"&&visible(k)) n++; } return n; }
  function render(){
    var st=STEPS[i], body=$("body"), opts=$("opts");
    var shown=STEPS.filter(function(_,k){return visible(k);}), pos=shown.indexOf(st);
    $("prog").style.width=Math.round(100*pos/shown.length)+"%";
    $("step").textContent = st.step || ("Ερώτηση "+qNum(st)+" από "+qTotal());
    $("title").textContent = typeof st.title==="function"?st.title(ans):st.title;
    $("hint").textContent=st.hint||""; $("hint").hidden=!st.hint;
    body.innerHTML=""; opts.innerHTML="";
    if(st.type==="say"){
      var d=document.createElement("div"); d.className="say"; d.textContent=st.say; body.appendChild(d);
      opts.appendChild(btn(st.btn||"Συνέχεια","primary",next));
    } else if(st.type==="text"){
      var ta=document.createElement("textarea"); ta.value=ans[st.key]||""; ta.placeholder="π.χ. ψεύτικες φωτογραφίες, τιμές, ιδιοκτήτες που δεν απαντάνε"; ta.setAttribute("aria-label","Η απάντησή σου");
      body.appendChild(ta);
      opts.appendChild(btn("Συνέχεια","primary",function(){ ans[st.key]=ta.value.trim(); next(); }));
    } else if(st.type==="multi"){
      var sel=(ans[st.key]||"").split(",").filter(Boolean), go;
      st.opts.forEach(function(o){
        var b=btn((sel.indexOf(o[0])>=0?"✓ ":"")+o[1], sel.indexOf(o[0])>=0?"on":"", function(){
          var k=sel.indexOf(o[0]); if(k>=0) sel.splice(k,1); else sel.push(o[0]);
          b.classList.toggle("on", sel.indexOf(o[0])>=0); b.textContent=(sel.indexOf(o[0])>=0?"✓ ":"")+o[1];
          go.disabled=!sel.length;
        });
        b.setAttribute("aria-pressed", sel.indexOf(o[0])>=0);
        opts.appendChild(b);
      });
      go=btn("Συνέχεια","primary",function(){ if(!sel.length) return; ans[st.key]=sel.join(","); next(); });
      go.disabled=!sel.length; opts.appendChild(go);
    } else {
      st.opts.forEach(function(o){ opts.appendChild(btn(o[1], ans[st.key]===o[0]?"on":"", function(){ ans[st.key]=o[0]; next(); })); });
    }
    $("back").style.visibility = i===0?"hidden":"visible";
    window.scrollTo(0,0);
  }
  function finish(){
    var rec={id:"s"+Date.now().toString(36)+Math.random().toString(36).slice(2,7), ts:new Date().toISOString()};
    KEYS.forEach(function(k){ rec[k] = (ans[k]===undefined||ans[k]==="") ? null : ans[k]; });
    if(FUT(ans)){ rec.scam=null; rec.price=null; }
    pending.push(rec); saveP(pending);
    $("prog").style.width="100%"; $("step").textContent=""; $("title").textContent="Ευχαριστούμε!"; $("hint").hidden=true;
    $("body").innerHTML='<div class="done"><div class="ok">✓ Η απάντησή σου καταχωρήθηκε</div><div class="where" id="where">Αποθηκεύεται…</div></div>'
      +'<p class="note" style="margin-top:14px">Το MeCity AI βγαίνει σύντομα. Αν σου άρεσε η ιδέα, στείλε την έρευνα σε έναν συμφοιτητή σου.</p>';
    $("opts").innerHTML=""; $("back").style.visibility="hidden"; $("cancel").hidden=true;
    flush();
  }
  var busy=false;
  function flush(){
    if(busy||!pending.length) return; busy=true;
    var batch=pending.slice();
    fetch(C.url+"/rest/v1/students?on_conflict=id",{method:"POST",
      headers:{"apikey":C.key,"Authorization":"Bearer "+C.key,"Content-Type":"application/json","Prefer":"resolution=ignore-duplicates,return=minimal"},
      body:JSON.stringify(batch)}).then(function(r){
        if(!r.ok) throw new Error(r.status);
        var sent={}; batch.forEach(function(b){sent[b.id]=1;});
        pending=pending.filter(function(p){return !sent[p.id];}); saveP(pending); busy=false;
        if($("where")) $("where").textContent="Αποθηκεύτηκε. Μπορείς να κλείσεις τη σελίδα.";
      }).catch(function(){
        busy=false;
        if($("where")) $("where").textContent="Δεν υπάρχει σύνδεση. Άφησε τη σελίδα ανοιχτή, θα σταλεί μόλις βρει ίντερνετ.";
        setTimeout(flush,8000);
      });
  }
  $("back").addEventListener("click",prev);
  $("cancel").addEventListener("click",function(){ ans={}; i=0; render(); });
  window.addEventListener("online",flush);
  render(); flush();
})();
