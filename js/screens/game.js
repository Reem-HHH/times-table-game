import { State } from '../core/app.js';
var PASTEL=['#FDE68A','#A7F3D0','#BFDBFE','#FBCFE8','#D8B4FE','#FCA5A5','#FDBA74','#86EFAC','#93C5FD','#FDE2FF'];
var timerRaf=null;
export function renderGame(){
  var main=document.getElementById('main');
  var N=State.session.table; var a=Math.floor(Math.random()*11);
  State.session.asked++; if(State.session.asked===1) State.session.start=performance.now();
  main.innerHTML=`<section class="screen">
    <div class="row" style="justify-content:space-between">
      <div class="stats">
        <div class="metric"><strong>Player</strong><span>${State.player}</span></div>
        <div class="metric"><strong>Table</strong><span>×${N}</span></div>
        <div class="metric"><strong>Score</strong><span>${State.session.correct}/${State.session.asked-1}</span></div>
        <div class="metric" id="timerTag"><strong>Time</strong><span>0s</span></div>
      </div>
    </div>
    <div class="card centered-card"><div class="card-body">
      <div class="hero" style="gap:8px">
        <h2 style="font-size:58px; margin:6px 0">${a} × ${N} = ?</h2>
        <div id="tally" class="tally"></div>
        <div class="label">Type your answer</div>
        <div class="row">
          <input id="ans" class="input" style="max-width:220px" inputmode="numeric" pattern="[0-9]*" placeholder="Answer" />
          <button class="btn primary" id="checkBtn">Check</button>
          <button class="btn secondary" id="hintBtn">${State.session.showSkip ? 'Hide' : 'Show'} skip-count</button>
        </div>
        <div class="label" id="skipLine" style="min-height:18px"></div>
      </div>
    </div></div></section>`;
  drawTally(N,a,State.session.showSkip);
  var input=document.getElementById('ans'); input.focus();
  function onCheck(){ var val=Number(input.value.trim()); var ok=(val===a*N); if(ok){ if(window.App&&window.App.Audio&&window.App.Audio.correct) window.App.Audio.correct(); State.session.correct++; } else { if(window.App&&window.App.Audio&&window.App.Audio.wrong) window.App.Audio.wrong(); } nextOrFinish(); }
  document.getElementById('checkBtn').onclick=onCheck;
  input.onkeydown=function(e){ if(e.key==='Enter') onCheck(); };
  document.getElementById('hintBtn').onclick=function(){ State.session.showSkip=!State.session.showSkip; document.getElementById('hintBtn').textContent=State.session.showSkip?'Hide skip-count':'Show skip-count'; drawTally(N,a,State.session.showSkip); };
  var start=State.session.start;
  (function tick(){ var tag=document.getElementById('timerTag'); if(!tag) return; var elapsed=Math.max(0,performance.now()-start); tag.innerHTML='<strong>Time</strong><span>'+Math.floor(elapsed/1000)+'s</span>'; timerRaf=requestAnimationFrame(tick); })();
  function nextOrFinish(){ cancelAnimationFrame(timerRaf); if(State.session.asked>=State.session.total){ State.session.time=performance.now()-State.session.start; return finishRound(); } renderGame(); }
}
function finishRound(){
  var scores=JSON.parse(localStorage.getItem('mm_scores')||'[]');
  var s={ name:window.App.State.player, table:window.App.State.session.table, correct:window.App.State.session.correct, total:window.App.State.session.total, time:performance.now()-window.App.State.session.start, date:Date.now() };
  scores.push(s); localStorage.setItem('mm_scores', JSON.stringify(scores));
  var main=document.getElementById('main');
  main.innerHTML=`<section class="screen hero">
    <h2>Great job, ${window.App.State.player}! 🎉</h2>
    <p>You scored <strong>${s.correct}/${s.total}</strong> on the ×${s.table} table<br/>in <strong>${Math.round(s.time/1000)}s</strong>.</p>
    <div class="row" style="justify-content:center; gap:12px">
      <button class="btn primary" id="againBtn">Play again</button>
      <button class="btn secondary" id="tablesBtn">Choose another table</button>
      <button class="btn" id="lbBtn">View Leaderboard</button>
    </div></section>`;
  document.getElementById('againBtn').onclick=function(){ window.App.State.session={ table:s.table, total:10, asked:0, correct:0, start:0, time:0, showSkip:false }; renderGame(); };
  document.getElementById('tablesBtn').onclick=function(){ window.App.setScreen('select'); };
  document.getElementById('lbBtn').onclick=function(){ window.App.setScreen('leader'); };
}
function drawTally(N,a,showSkip){
  var cont=document.getElementById('tally'); cont.innerHTML=''; cont.style.gridTemplateRows='repeat('+(a>0?a:1)+',auto)';
  if(a===0){ cont.innerHTML='<div class="label">Zero groups — total is 0.</div>'; document.getElementById('skipLine').textContent=showSkip?'0':''; return; }
  var P=['#FDE68A','#A7F3D0','#BFDBFE','#FBCFE8','#D8B4FE','#FCA5A5','#FDBA74','#86EFAC','#93C5FD','#FDE2FF'];
  for(var r=0;r<a;r++){ var row=document.createElement('div'); row.className='rowDots'; row.style.gridTemplateColumns='repeat('+N+', auto)'; var color=P[r%P.length]; for(var c=0;c<N;c++){ var d=document.createElement('div'); d.className='dot'; d.style.background=color; d.style.color=color; row.appendChild(d);} cont.appendChild(row); }
  document.getElementById('skipLine').textContent=showSkip? Array.from({length:a},function(_,i){return (i+1)*N;}).join(', ') : '';
}