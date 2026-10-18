(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  const status=$('#announcement');
  const themes={rose:{hex:'#edb0cb',rgb:[237,176,203]},ice:{hex:'#a9e5e2',rgb:[169,229,226]},lilac:{hex:'#c3b1f3',rgb:[195,177,243]}};
  function setTheme(name,announce=false){const theme=themes[name]||themes.rose;document.documentElement.style.setProperty('--accent',theme.hex);document.documentElement.style.setProperty('--accent-rgb',theme.rgb.join(','));$$('.swatch').forEach(b=>{const selected=b.dataset.theme===name;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});document.dispatchEvent(new CustomEvent('themechange',{detail:theme}));if(announce)status.textContent=name+' color theme selected.';try{localStorage.setItem('mashood-theme',name);}catch(_){}}
  let saved;try{saved=localStorage.getItem('mashood-theme');}catch(_){}if(saved&&themes[saved])setTheme(saved);
  $$('.swatch').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme,true)));
  function setMotion(value){paused=value;document.documentElement.classList.toggle('motion-paused',paused);$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle').setAttribute('aria-label',paused?'Resume visual motion':'Pause visual motion');$('#motion-toggle').firstElementChild.textContent=paused?'▷':'Ⅱ';document.dispatchEvent(new CustomEvent('motionchange',{detail:{paused}}));if(paused)$$('.tilt-card').forEach(c=>c.style.transform='');}
  setMotion(paused);$('#motion-toggle').addEventListener('click',()=>setMotion(!paused));
  if(reduced.addEventListener)reduced.addEventListener('change',e=>setMotion(e.matches));
  const stars=$('#stars'),frag=document.createDocumentFragment();let seed=42;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};for(let i=0;i<65;i++){const dot=document.createElement('i');dot.className='star';dot.style.cssText=`left:${random()*100}%;top:${random()*100}%;animation-delay:${-random()*8}s;animation-duration:${4+random()*5}s`;frag.appendChild(dot);}stars.appendChild(frag);
  $$('.tilt-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*8}deg) rotateY(${x*10}deg) translateY(-5px)`;});card.addEventListener('pointerleave',()=>{card.style.transform='';});card.addEventListener('blur',()=>{card.style.transform='';});});
  const progress=$('.scroll-progress');let scrollTick=false;function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;scrollTick=false;}window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
  const audio=$('#music'),toggle=$('#music-toggle'),musicStatus=$('#music-status');audio.volume=.4;
  function audioUI(){const playing=!audio.paused;document.body.classList.toggle('playing',playing);toggle.setAttribute('aria-pressed',String(playing));toggle.setAttribute('aria-label',playing?'Pause Chandelier':'Play Chandelier');toggle.querySelector('.play-icon').textContent=playing?'Ⅱ':'▶';musicStatus.textContent=playing?'WIL PAQUIN · NOW PLAYING':'WIL PAQUIN · SOUND OFF';}
  let playPending=false;
  toggle.addEventListener('click',async()=>{if(playPending)return;if(!audio.paused){audio.pause();return;}playPending=true;try{await audio.play();}catch(_){musicStatus.textContent='UNABLE TO PLAY · TRY AGAIN';status.textContent='Audio could not start. Try pressing play again.';}finally{playPending=false;}});
  audio.addEventListener('play',audioUI);audio.addEventListener('pause',audioUI);audio.addEventListener('error',()=>{document.body.classList.remove('playing');toggle.setAttribute('aria-pressed','false');toggle.setAttribute('aria-label','Retry playing Chandelier');toggle.querySelector('.play-icon').textContent='▶';musicStatus.textContent='AUDIO UNAVAILABLE';status.textContent='The music file could not be loaded.';});
  $('#volume').addEventListener('input',e=>{audio.volume=Number(e.target.value);});
})();
