export function createAudio(onState){
  var Ctx=window.AudioContext||window.webkitAudioContext; var ctx=new Ctx();
  var playing=false; var master=ctx.createGain(); master.gain.value=0.16; master.connect(ctx.destination);
  var A4=440; function note(n){ return A4*Math.pow(2,(n-69)/12); }
  function voice(t,f,d,type,v){ if(d===undefined)d=0.35; if(type===undefined)type='triangle'; if(v===undefined)v=0.20;
    var o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=f;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+d+0.05);
  }
  function pad(t,freqs,d,v){ if(d===undefined)d=0.9; if(v===undefined)v=0.1;
    for(var i=0;i<freqs.length;i++){ voice(t, freqs[i], d*(1-0.05*i), i?'sine':'triangle', v/(i+1)); }
  }
  var songs=[
    { name:'Sunny Steps', bpm:96,  scale:[60,62,64,65,67,69,71,72],  prog:[[0,4,7],[2,5,9],[4,7,11],[0,4,7]] },
    { name:'Playground Pop', bpm:104, scale:[65,67,69,70,72,74,76,77], prog:[[0,4,7],[3,7,10],[4,7,11],[0,4,7]] },
    { name:'Bubble Bounce', bpm:110, scale:[67,69,71,72,74,76,78,79],  prog:[[0,4,7],[5,9,12],[4,7,11],[0,4,7]] }
  ];
  var track=0, timer=null, nextTime=0;
  function schedule(){
    var s=songs[track]; var spb=60/s.bpm; if(nextTime<ctx.currentTime) nextTime=ctx.currentTime+0.05;
    for(var beat=0; beat<4; beat++){
      var bar=Math.floor((nextTime/spb)/4);
      var ch=s.prog[bar % s.prog.length];
      var freqs=[]; for(var i=0;i<ch.length;i++){ freqs.push(note(s.scale[ch[i] % s.scale.length])); }
      pad(nextTime, freqs, spb*1.8, 0.08);
      var m=(bar*2+beat)%s.scale.length; voice(nextTime+0.02, note(s.scale[m]+12), spb*0.7, 'triangle', 0.16);
      nextTime+=spb;
    }
  }
  function loop(){ schedule(); timer=setTimeout(loop,250); }
  function currentTrackName(){ return songs[track].name; }
  function startBg(){
    if(playing) return;
    playing=true;
    if(onState){ onState({ playing: playing, track: currentTrackName() }); }
    window.addEventListener('pointerdown', function(){ try{ ctx.resume(); }catch(e){} }, {once:true});
    nextTime=ctx.currentTime+0.05; loop();
  }
  function stop(){ if(timer){ clearTimeout(timer); timer=null; } playing=false; if(onState){ onState({ playing: playing, track: currentTrackName() }); } }
  function toggleMusic(){ if(playing) stop(); else startBg(); }
  function nextTrack(){ stop(); track=(track+1)%songs.length; startBg(); }
  function correct(){ voice(ctx.currentTime,880,0.12,'square',0.25); voice(ctx.currentTime+0.05,1175,0.12,'square',0.20); }
  function wrong(){
    var o=ctx.createOscillator(), g=ctx.createGain(); o.type='sawtooth';
    o.frequency.setValueAtTime(320,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(160,ctx.currentTime+0.22);
    g.gain.value=0.18; o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime+0.22);
  }
  return { startBg:startBg, stop:stop, toggleMusic:toggleMusic, nextTrack:nextTrack, currentTrackName:currentTrackName, correct:correct, wrong:wrong };
}