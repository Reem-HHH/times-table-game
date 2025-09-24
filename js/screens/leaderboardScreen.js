import { State } from '../core/app.js';
function topN(arr,n){ return arr.slice().sort(function(a,b){ return (b.correct-a.correct) || (a.time-b.time); }).slice(0,n); }
function esc(s){ var m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}; return String(s).replace(/[&<>"']/g,function(x){return m[x]}); }
function section(title,rows){
  var items=rows.map(function(r,i){ return '<div class="row" style="justify-content:space-between">\
    <div><strong>#'+(i+1)+'</strong> — '+esc(r.name)+' <span class="label">(×'+r.table+')</span></div>\
    <div><span class="label">'+r.correct+'/'+r.total+'</span> • <strong>'+Math.round(r.time/1000)+'s</strong></div>\
  </div>'; }).join('');
  return '<div class="card"><div class="card-body">\
    <h3 style="margin-bottom:8px">'+esc(title)+'</h3>\
    <div class="grid">'+(items || '<div class="label">No scores yet.</div>')+'</div>\
  </div></div>';
}
export function renderLeaderboard(){
  var main=document.getElementById('main');
  var scores=JSON.parse(localStorage.getItem('mm_scores')||'[]');
  var currentTable=(State.session && typeof State.session.table==='number') ? State.session.table : null;
  var tables=Array.from(new Set(scores.map(function(s){return s.table;}))).sort(function(a,b){return a-b;});
  var options=['<option value="">All tables</option>'].concat(tables.map(function(t){ return '<option value="'+t+'" '+(currentTable===t?'selected':'')+'>×'+t+'</option>'; })).join('');
  main.innerHTML='<section class="screen">\
    <div class="hero"><h1>Leaderboard</h1><p>Top scores across all tables'+(currentTable!=null? ' and for ×'+currentTable : '')+'.</p></div>\
    <div class="card centered-card"><div class="card-body">\
      <div class="row" style="justify-content:space-between; width:100%">\
        <div class="row"><label class="label" for="lbFilter">Filter:</label>\
          <select id="lbFilter" class="input" style="width:180px; text-align:left">'+options+'</select>\
        </div>\
        <div class="row"><button class="btn danger" id="lbReset">Reset Leaderboard</button></div>\
      </div></div></div>\
    <div id="lbContent"></div></section>';
  function renderLists(filterTable){
    var area=document.getElementById('lbContent');
    var topAll=topN(scores,10);
    var per=typeof filterTable==='number'? topN(scores.filter(function(s){return s.table===filterTable;}),10) : [];
    area.innerHTML= section('Top 10 (All Tables)', topAll) + (typeof filterTable==='number' ? section('Top 10 (×'+filterTable+')', per) : '');
  }
  var sel=document.getElementById('lbFilter');
  sel.onchange=function(){ var v=sel.value.trim(); renderLists(v===''? null : Number(v)); };
  document.getElementById('lbReset').onclick=function(){ localStorage.setItem('mm_scores','[]'); renderLeaderboard(); };
  renderLists(currentTable);
}