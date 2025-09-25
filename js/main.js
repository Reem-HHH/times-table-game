import { State, AppAPI } from './core/app.js';
import { createAudio } from './core/audio.js';
import { renderStart } from './screens/start.js';
import { renderSelect } from './screens/select.js';
import { renderGame } from './screens/game.js';
import { renderPrint } from './screens/print.js';
import { renderLeaderboard } from './screens/leaderboardScreen.js';

function setScreen(name){
  State.screen = name;
  if(name==='start') renderStart();
  else if(name==='select') renderSelect();
  else if(name==='game') renderGame();
  else if(name==='print') renderPrint();
  else if(name==='leader') renderLeaderboard();
}

function confirmLeaveRound(target){
  var modal=document.getElementById('modal');
  var body=document.getElementById('modalBody');
  body.innerHTML='<h3>Leave current round?</h3><p class="label">Your progress for this round will be lost.</p>';
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  document.getElementById('modalCancel').onclick=function(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
  document.getElementById('modalConfirm').onclick=function(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); setScreen(target); };
}
window.App = { State: State, setScreen: setScreen, confirmLeaveRound: confirmLeaveRound };

var homeBtn=document.getElementById('homeBtn');
var backBtn=document.getElementById('backBtn');
var leaderBtn=document.getElementById('leaderBtn');
var printBtn=document.getElementById('printBtn');
var musicBtn=document.getElementById('musicBtn');

homeBtn.onclick=function(){ if(State.screen==='game') confirmLeaveRound('start'); else setScreen('start'); };
backBtn.onclick=function(){
  if(State.screen==='game') confirmLeaveRound('select');
  else if(State.screen==='print') setScreen('select');
  else if(State.screen==='leader') setScreen('select');
  else if(State.screen==='select') setScreen('start');
};
leaderBtn.onclick=function(){ setScreen('leader'); };
printBtn.onclick=function(){ if(State.screen==='game') confirmLeaveRound('print'); else setScreen('print'); };

var audio=createAudio(function(state){ /* could update UI */ });
window.App.Audio=audio;
function updateMusic(){ var name = audio.currentTrackName ? audio.currentTrackName() : 'Music'; musicBtn.textContent='🎵'+name; }
musicBtn.onclick=function(e){ if(e.shiftKey) audio.nextTrack(); else audio.toggleMusic(); updateMusic(); };
updateMusic();

AppAPI.setScreen = setScreen;
setScreen('start');
