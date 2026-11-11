/* MeCity AI · Έρευνα φοιτητών — σελίδα αποτελεσμάτων (δεν συνδέεται από τη φόρμα) */
(function(){
  "use strict";
  var C=window.MECITY, $=function(id){return document.getElementById(id);};
  var rows=[];
  var L={
    living:{rent_alone:"Νοικιάζει μόνος/η",rent_shared:"Νοικιάζει με συγκάτοικο",parents:"Με τους γονείς",dorm:"Εστία"},
    city:{athens:"Αθήνα",thessaloniki:"Θεσσαλονίκη",patra:"Πάτρα",heraklion:"Ηράκλειο",other:"Άλλη"},
    sources:{xe:"xe.gr",spitogatos:"Spitogatos",facebook:"Facebook groups",agent:"Μεσίτης",friends:"Φίλοι / γνωστοί"},
    scam:{different:"Διαφορετική απ' ό,τι έδειχνε",scam:"Απάτη",no:"Όχι"},
    price:{yes:"Ναι",no:"Όχι",nocall:"Δεν πήρε τηλέφωνο"},
    yn:{yes:"Ναι",no:"Όχι",maybe:"Ίσως"},
    budget:{"<300":"<300€","300-400":"300–400€","400-500":"400–500€","500+":"500€+"}
  };
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function pct(a,b){ return b?Math.round(100*a/b):0; }
  function cnt(l,k,v){ return l.filter(function(r){return r[k]===v;}).length; }
  function has(l,k){ return l.filter(function(r){return r[k]!=null&&r[k]!=="";}); }
  function bar(label,a,b){ return '<div class="bar"><div class="t"><span>'+esc(label)+'</span><span>'+a+' από '+b+' · '+pct(a,b)+'%</span></div><div class="b"><i style="width:'+pct(a,b)+'%"></i></div></div>'; }
  function kpi(a,b,label){ return '<div class="card kpi"><div class="big">'+pct(a,b)+'%</div><div class="lbl">'+esc(label)+'</div><div class="sub">'+a+' από '+b+'</div></div>'; }
  function card(title,inner){ return '<div class="card" style="margin-top:10px"><h2>'+esc(title)+'</h2>'+inner+'</div>'; }
  function dist(list,key,map){ var h=""; Object.keys(map).forEach(function(k){ h+=bar(map[k],cnt(list,key,k),list.length); }); return h; }

  function render(){
    var all = rows;
    var n=all.length, el=$("res");
    $("count").textContent=rows.length;
    if(!n){ el.innerHTML='<div class="card"><h2>Καμία απάντηση ακόμα</h2><p class="note">Μόλις συμπληρώσει κάποιος τη φόρμα, εμφανίζεται εδώ.</p></div>'; return; }
    var U=has(all,"use"), T=has(all,"trust"), P=all.filter(function(r){return r.price==="yes"||r.price==="no";}), S=has(all,"scam"), A=has(all,"ai");
    var h='<div class="grid">'+kpi(cnt(U,"use","yes"),U.length,"θα το χρησιμοποιούσαν")+kpi(cnt(T,"trust","yes"),T.length,"εμπιστεύονται AI για το ενοίκιο")+'</div>';
    h+=card("Τα βασικά",
      bar("Πήραν τηλέφωνο χωρίς να ξέρουν αν το ενοίκιο είναι λογικό",cnt(P,"price","no"),P.length)
      +bar("Έπεσαν σε αγγελία διαφορετική απ' ό,τι έδειχνε",cnt(S,"scam","different"),S.length)
      +bar("Έπεσαν σε απάτη",cnt(S,"scam","scam"),S.length)
      +bar("Έχουν ήδη ρωτήσει AI για σπίτι",cnt(A,"ai","yes"),A.length)
      +bar("«Ίσως» στο αν θα το χρησιμοποιούσαν",cnt(U,"use","maybe"),U.length));
    var src=""; Object.keys(L.sources).forEach(function(k){ var c=all.filter(function(r){return (r.sources||"").split(",").indexOf(k)>=0;}).length; src+=bar(L.sources[k],c,n); });
    h+=card("Πού ψάχνουν (πολλές επιλογές)",src);
    h+=card("Budget (δικό τους μερίδιο)",dist(has(all,"budget"),"budget",L.budget));
    var ub=""; Object.keys(L.budget).forEach(function(k){ var G=U.filter(function(r){return r.budget===k;}); ub+=bar(L.budget[k],cnt(G,"use","yes"),G.length); });
    h+=card("«Θα το χρησιμοποιούσα» ανά budget",ub);
    h+=card("Πού μένουν",dist(all,"living",L.living));
    var q=all.filter(function(r){return r.pain;}).sort(function(a,b){return (b.ts||"").localeCompare(a.ts||"");});
    var qs=q.length?"":'<p class="note">Καμία ακόμα.</p>';
    q.forEach(function(r){ qs+='<div class="quote">'+esc(r.pain)+'<small>'+esc(L.living[r.living]||"")+(r.budget?' · '+esc(L.budget[r.budget]||r.budget):'')+'</small></div>'; });
    h+=card("Τι τους δυσκολεύει ("+q.length+")",qs);
    h+=card("Εξαγωγή",'<p class="note">Αντιγράφει τις απαντήσεις για Excel ή Sheets.</p><div class="row"><button class="opt" id="copy" type="button">Αντιγραφή πίνακα</button></div><p class="note" id="copy-msg"></p><textarea id="csv" hidden readonly aria-label="Πίνακας"></textarea>');
    el.innerHTML=h;
    $("copy").addEventListener("click",function(){ copy(all); });
  }
  function copy(list){
    var cols=[["ts","Ώρα"],["living","Μένει"],["sources","Πού ψάχνει"],["pain","Δυσκολία"],["scam","Αγγελία ≠ πραγματικότητα"],["price","Ήξερε αν το ενοίκιο είναι λογικό"],["ai","Ρώτησε AI"],["budget","Budget"],["use","Θα το χρησιμοποιούσε"],["trust","Εμπιστεύεται AI"]];
    var fmt=function(k,v){ if(v==null) return ""; if(k==="sources") return v.split(",").map(function(s){return L.sources[s]||s;}).join(", ");
      if(L[k]&&L[k][v]) return L[k][v]; if((k==="ai"||k==="use"||k==="trust")&&L.yn[v]) return L.yn[v]; return v; };
    var lines=[cols.map(function(c){return c[1];}).join("\t")];
    list.slice().sort(function(a,b){return (a.ts||"").localeCompare(b.ts||"");}).forEach(function(r){ lines.push(cols.map(function(c){ return String(fmt(c[0],r[c[0]])).replace(/[\t\n\r]+/g," "); }).join("\t")); });
    var t=lines.join("\n"), msg=$("copy-msg"), box=$("csv");
    var fb=function(){ box.hidden=false; box.value=t; box.select(); msg.textContent="Διάλεξε το κείμενο και κάνε αντιγραφή."; };
    try{ navigator.clipboard.writeText(t).then(function(){ msg.textContent="Αντιγράφηκε. Κάνε επικόλληση σε Excel ή Sheets."; },fb); }catch(e){ fb(); }
  }
  function load(){
    fetch(C.url+"/rest/v1/students?select=*&order=ts.desc&limit=10000",{headers:{"apikey":C.key,"Authorization":"Bearer "+C.key}})
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){ rows=d||[]; $("sync").textContent="✓ Ενημερωμένα"; $("sync").className=""; render(); })
      .catch(function(){ $("sync").textContent="Χωρίς σύνδεση"; $("sync").className="warn"; });
  }
  load(); setInterval(function(){ if(!document.hidden) load(); },20000);
})();
