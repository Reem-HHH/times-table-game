import { State, AppAPI } from '../core/app.js';
export function renderStart(){
  var main=document.getElementById('main');
  main.innerHTML='<section class="screen hero">    <h1>Let’s practice multiplication!</h1>    <p>Type your name to begin.</p>    <div class="card start-card centered-card"><div class="card-body">      <div class="grid" style="justify-items:center">        <input class="input" id="nameInput" placeholder="👤 Your name" />        <div class="start-actions"><button class="btn primary" id="startBtn">🚀 Start</button></div>      </div></div></div></section>';
  var input=document.getElementById('nameInput'); input.focus();
  function go(){ State.player=(input.value.trim()||'Player'); AppAPI.setScreen('select'); }
  document.getElementById('startBtn').onclick=go;
  input.onkeydown=function(e){ if(e.key==='Enter') go(); };
}