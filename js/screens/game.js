// Bring in global app state (player name, current session, etc.)
import { State } from '../core/app.js';

// Nice pastel colors used for the tally rows (one color per row)
var PASTEL=['#FDE68A','#A7F3D0','#BFDBFE','#FBCFE8','#D8B4FE','#FCA5A5','#FDBA74','#86EFAC','#93C5FD','#FDE2FF'];

// Used to cancel the timer animation between questions
var timerRaf=null;

/**
 * Main screen for the game: shows the problem, tally blocks, answer input, and score/time.
 */
export function renderGame(){
  var main=document.getElementById('main');

  // N = chosen multiplication table (×N), a = random factor 0..10
  var N=State.session.table;
  var a=Math.floor(Math.random()*11);

  // Track progress: increment how many questions asked; on first one, start the timer
  State.session.asked++;
  if(State.session.asked===1) State.session.start=performance.now();

  // Build the game UI (stats, problem line, tally area, answer input, buttons)
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
        <!-- The current question -->
        <h2 style="font-size:58px; margin:6px 0">${a} × ${N} = ?</h2>

        <!-- Visual counting aid will be drawn here -->
        <div id="tally" class="tally"></div>

        <div class="label">Type your answer</div>

        <!-- Answer input + actions -->
        <div class="row">
          <input id="ans" class="input" style="max-width:220px" inputmode="numeric" pattern="[0-9]*" placeholder="Answer" />
          <button class="btn primary" id="checkBtn">Check</button>
          <!-- Toggle showing the skip-count sequence (N, 2N, 3N, …) -->
          <button class="btn secondary" id="hintBtn">${State.session.showSkip ? 'Hide' : 'Show'} skip-count</button>
        </div>

        <!-- Where the skip-count sequence appears -->
        <div class="label" id="skipLine" style="min-height:18px"></div>
      </div>
    </div></div></section>`;

  // Draw the colored tally grid for a × N
  drawTally(N,a,State.session.showSkip);

  // Focus the input so kids can type right away
  var input=document.getElementById('ans');
  input.focus();

  // When clicking "Check" or pressing Enter, validate answer and go to next
  function onCheck(){
    var val=Number(input.value.trim());
    var ok=(val===a*N);

    // Play sounds (if audio is available), update score
    if(ok){
      if(window.App&&window.App.Audio&&window.App.Audio.correct) window.App.Audio.correct();
      State.session.correct++;
    } else {
      if(window.App&&window.App.Audio&&window.App.Audio.wrong) window.App.Audio.wrong();
    }

    nextOrFinish();
  }

  document.getElementById('checkBtn').onclick=onCheck;
  input.onkeydown=function(e){ if(e.key==='Enter') onCheck(); };

  // Toggle skip-count visibility (sequence N, 2N, 3N… to help skip-counting)
  document.getElementById('hintBtn').onclick=function(){
    State.session.showSkip=!State.session.showSkip;
    document.getElementById('hintBtn').textContent=State.session.showSkip?'Hide skip-count':'Show skip-count';
    drawTally(N,a,State.session.showSkip);
  };

  // Simple running timer (updates once per animation frame)
  var start=State.session.start;
  (function tick(){
    var tag=document.getElementById('timerTag');
    if(!tag) return; // if we navigated away
    var elapsed=Math.max(0,performance.now()-start);
    tag.innerHTML='<strong>Time</strong><span>'+Math.floor(elapsed/1000)+'s</span>';
    timerRaf=requestAnimationFrame(tick);
  })();

  // After checking, either render next question or finish round
  function nextOrFinish(){
    cancelAnimationFrame(timerRaf);
    if(State.session.asked>=State.session.total){
      State.session.time=performance.now()-State.session.start;
      return finishRound();
    }
    renderGame();
  }
}

/**
 * Called when you finish a set of questions.
 * Saves the score to localStorage and shows result + navigation options.
 */
function finishRound(){
  // Load scores, push this attempt, and save
  var scores=JSON.parse(localStorage.getItem('mm_scores')||'[]');
  var s={
    name:window.App.State.player,
    table:window.App.State.session.table,
    correct:window.App.State.session.correct,
    total:window.App.State.session.total,
    time:performance.now()-window.App.State.session.start,
    date:Date.now()
  };
  scores.push(s);
  localStorage.setItem('mm_scores', JSON.stringify(scores));

  // Results screen with actions
  var main=document.getElementById('main');
  main.innerHTML=`<section class="screen hero">
    <h2>Great job, ${window.App.State.player}! 🎉</h2>
    <p>You scored <strong>${s.correct}/${s.total}</strong> on the ×${s.table} table<br/>in <strong>${Math.round(s.time/1000)}s</strong>.</p>
    <div class="row" style="justify-content:center; gap:12px">
      <button class="btn primary" id="againBtn">Play again</button>
      <button class="btn secondary" id="tablesBtn">Choose another table</button>
      <button class="btn" id="lbBtn">View Leaderboard</button>
    </div></section>`;

  // Play again on the same table
  document.getElementById('againBtn').onclick=function(){
    window.App.State.session={ table:s.table, total:10, asked:0, correct:0, start:0, time:0, showSkip:false };
    renderGame();
  };

  // Navigate to table selection or leaderboard
  document.getElementById('tablesBtn').onclick=function(){ window.App.setScreen('select'); };
  document.getElementById('lbBtn').onclick=function(){ window.App.setScreen('leader'); };
}

/**
 * Draws the visual tally grid:
 * - a rows (the random factor)
 * - N dots per row (the chosen table)
 * - each row is a different pastel color for easy counting
 * - optional skip-count numbers (N, 2N, 3N…) if showSkip is true
 */
function drawTally(N,a,showSkip){
  var cont=document.getElementById('tally');
  cont.innerHTML='';
  // Ensure grid has at least 1 row so layout doesn’t collapse
  cont.style.gridTemplateRows='repeat('+(a>0?a:1)+',auto)';

  // Special case: 0 groups → show a message; skip line is "0" if enabled
  if(a===0){
    cont.innerHTML='<div class="label">Zero groups — total is 0.</div>';
    document.getElementById('skipLine').textContent=showSkip?'0':'';
    return;
  }

  // Build a rows where each row has N colored dots
  var P=['#FDE68A','#A7F3D0','#BFDBFE','#FBCFE8','#D8B4FE','#FCA5A5','#FDBA74','#86EFAC','#93C5FD','#FDE2FF'];
  for(var r=0;r<a;r++){
    var row=document.createElement('div');
    row.className='rowDots';
    row.style.gridTemplateColumns='repeat('+N+', auto)'; // N columns per row
    var color=P[r%P.length];
    for(var c=0;c<N;c++){
      var d=document.createElement('div');
      d.className='dot';
      d.style.background=color;  // fill color
      d.style.color=color;       // used for print border color
      row.appendChild(d);
    }
    cont.appendChild(row);
  }

  // Show the skip-count series under the input if enabled
  // Example (×4, a=5): "4, 8, 12, 16, 20"
  document.getElementById('skipLine').textContent=
    showSkip ? Array.from({length:a},function(_,i){return (i+1)*N;}).join(', ') : '';
}
