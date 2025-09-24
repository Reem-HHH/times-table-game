import { State, AppAPI } from '../core/app.js';
export function renderSelect(){
  var main=document.getElementById('main');
  var emojis=['🌟','🍎','🧩','🎈','🐠','🚀','🧸','🍉','🐞','🌈','🪄'];
  var tiles=''; for(var i=0;i<=10;i++){ tiles+=`<button class="tile" data-n="${i}">${emojis[i%emojis.length]} ×${i}</button>`; }
  main.innerHTML=`<section class="screen"><div class="hero">
    <h1>Pick a times table</h1><p>${State.player?('Ready, '+State.player+'?'):'Choose any number 0–10.'}</p></div>
    <div class="tiles">${tiles}</div></section>`;
  Array.prototype.forEach.call(document.querySelectorAll('.tile'), function(btn){
    btn.onclick=function(){
      var n=Number(btn.getAttribute('data-n'));
      State.session={ table:n, total:10, asked:0, correct:0, start:0, time:0, showSkip:false };
      AppAPI.setScreen('game');
    };
  });
}