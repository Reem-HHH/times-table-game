import { State } from '../core/app.js';
var PASTEL=['#FDE68A','#A7F3D0','#BFDBFE','#FBCFE8','#D8B4FE','#FCA5A5','#FDBA74','#86EFAC','#93C5FD','#FDE2FF'];
function drawCard(n,a){
  var grid=''; for(var r=0;r<a;r++){ var color=PASTEL[r%PASTEL.length]; var dots=''; for(var c=0;c<n;c++){ dots+=`<div class="dot" style="background:${color}; color:${color}"></div>`; } grid+=`<div class="rowDots" style="grid-template-columns:repeat(${n},auto)">${dots}</div>`; }
  return `<div class="card worksheet"><div class="card-body">
    <div class="row" style="justify-content:space-between; align-items:baseline">
      <strong style="font-size:18px">${a} × ${n} = ______</strong><span class="label">Count the blocks</span>
    </div>
    <div class="tally" style="grid-template-rows:repeat(${(a>0?a:1)},auto)">${a===0?'<div class="label">Zero groups — total is 0.</div>':grid}</div>
  </div></div>`;
}
export function renderPrint(){
  var main=document.getElementById('main');
  var def=(State.session && typeof State.session.table==='number')? State.session.table : 0;
  main.innerHTML=`<section class="screen">
    <div class="hero"><h1>Printable Worksheets</h1><p>Choose a table and how many problems to print.</p></div>
    <div class="card centered-card"><div class="card-body">
      <div class="row" style="justify-content:center">
        <label>Table: <input id="ptTable" class="input" type="number" min="0" max="10" value="${def}" style="width:90px"></label>
        <label>Problems: <input id="ptCount" class="input" type="number" min="1" max="20" value="10" style="width:110px"></label>
        <button class="btn secondary" id="previewBtn">Preview</button>
        <button class="btn primary" id="printNow">Print</button>
      </div></div></div>
    <div class="worksheet-grid" id="previewArea"></div></section>`;
  function preview(){ var n=clamp(Number(document.getElementById('ptTable').value),0,10); var c=clamp(Number(document.getElementById('ptCount').value),1,20); var html=''; for(var i=0;i<c;i++){ html+=drawCard(n, Math.floor(Math.random()*11)); } document.getElementById('previewArea').innerHTML=html; }
  document.getElementById('previewBtn').onclick=preview;
  document.getElementById('printNow').onclick=function(){ if(!document.getElementById('previewArea').innerHTML.trim()) preview(); window.print(); };
}
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }