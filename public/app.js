import {keys,presets,decodeState,encodeState,toggleDimension,diagnose} from './model.js';
import {archetypes,placeLabels,closestArchetype} from './archetypes.js';
const $=s=>document.querySelector(s);
let {values,selected}=decodeState(location.hash);
const canvas=$('#surface'),ctx=canvas.getContext('2d'),map=$('#map');
let width=800,height=388,yaw=-.62,pitch=.49,zoom=1,drag=null,frame=0;
const labelLayer=document.createElement('div');
labelLayer.className='surface-labels';labelLayer.setAttribute('role','group');labelLayer.setAttribute('aria-label','3D archetypes — select one to locate yourself');
$('#plot').append(labelLayer);
const labelButtons=archetypes.map(archetype=>{
  const button=document.createElement('button');button.className='surface-label';button.textContent=archetype.label;
  button.dataset.archetype=archetype.id;
  button.title=`${archetype.label} · Doing ${archetype.values.doing}, Yapping ${archetype.values.yapping}, Brains ${archetype.values.brains}`;
  button.setAttribute('aria-label',button.title);
  button.addEventListener('click',()=>{values={...archetype.values};render();announce('Archetype loaded. Try not to make it your entire personality.');});
  labelLayer.append(button);return button;
});
const colors={doing:'#4c7e5d',yapping:'#cd9457',brains:'#967db0'};
function render(){
  for(const k of keys){
    $('#'+k).value=values[k];$('#'+k+'-value').value=values[k];$('#'+k).style.setProperty('--range',values[k]+'%');
    $('#'+k).disabled=!selected.includes(k);$(`[data-slider="${k}"]`).classList.toggle('inactive',!selected.includes(k));
    $(`[data-dimension="${k}"]`).setAttribute('aria-pressed',String(selected.includes(k)));
  }
  const is3=selected.length===3,original=selected.includes('doing');
  $('#mode').textContent=is3?'3D SURFACE':original?'2D · ORIGINAL':'2D · REMIX';
  $('#plot').classList.toggle('is-map',!is3);
  labelLayer.hidden=!is3;
  canvas.hidden=!is3;canvas.style.display=is3?'block':'none';map.hidden=is3;
  $('#plot-badge').hidden=!is3;$('#reset-view').hidden=!is3;
  $('#doing-alias').textContent=!is3&&!selected.includes('yapping')?'as Boldness':'';
  $('#chart-title').textContent=is3?'The luck surface':!selected.includes('brains')?'The Doing-to-Yapping Ratio':!selected.includes('yapping')?'The boldness-to-brains ratio':'The yapping-to-brains ratio';
  $('#chart-subtitle').textContent=is3?'Three variables. Zero guarantees.':!selected.includes('brains')?'Why some people are just insanely “lucky”.':!selected.includes('yapping')?'Why brains alone don’t make you rich.':'Why the loudest person has a podcast.';
  $('#chart-hint').innerHTML=is3?'↔ Drag to orbit <span>·</span> Scroll to zoom':(matchMedia('(max-width:760px)').matches?'Swipe to explore · Tap to locate yourself':'Tap the map to locate yourself');
  $('#chart-dimensions').textContent=selected.map(x=>x.toUpperCase()).join(' × ');
  $('#model-note').textContent=is3?'The orange dot is you. The dark label is your closest archetype. Click any label to try their life choices.':!selected.includes('yapping')?'Lauris’s original map. Doing becomes Boldness in this view. Original labels; interactive redraw.':original?'Lauris’s original labels, redrawn as an interactive map. Same joke. Now with a dot for your ego.':'An unofficial bonus remix. Lauris supplied the inspiration; we supplied the podcast slander.';
  const d=diagnose(values,selected),closest=closestArchetype(values,selected);
  $('#diagnosis-title').textContent=closest.label;
  $('#diagnosis-copy').textContent=diagnose(closest.values).copy;
  $('#match-basis').textContent=`Nearest of ${archetypes.length} archetypes · ${selected.map(k=>k[0].toUpperCase()+k.slice(1)).join(' + ')}`;
  $('#match-distance').textContent=closest.distance===0?'An exact match. We regret to inform you.':'Your nearest neighbour in questionable life choices.';
  $('#energy').textContent=d.energy+'%';$('#energy-fill').style.width=d.energy+'%';
  for(let i=0;i<labelButtons.length;i++)labelButtons[i].dataset.closest=String(archetypes[i].id===closest.id);
  if(is3)requestDraw();else renderMap();
}
for(const k of keys){$('#'+k).addEventListener('input',e=>{values[k]=+e.target.value;render();});$(`[data-dimension="${k}"]`).addEventListener('click',()=>{
  const next=toggleDimension(selected,k);if(next===selected){announce('Keep at least two dimensions. Even this model has standards.');return;}selected=next;render();
});}
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{values={...presets[button.dataset.preset]};render();announce('Preset loaded. Any resemblance to your coworkers is coincidental.');});
$('#randomize').addEventListener('click',()=>{values=Object.fromEntries(keys.map(k=>[k,Math.floor(Math.random()*101)]));render();announce('A completely unbiased reassessment. Allegedly.');});
let statusTimer;
function announce(text){clearTimeout(statusTimer);$('#action-status').textContent=text;$('#action-status').classList.add('toast-visible');statusTimer=setTimeout(()=>{$('#action-status').textContent='No sign-up. Your ego is the only thing at risk.';$('#action-status').classList.remove('toast-visible');},6500);}
$('#share').addEventListener('click',async()=>{
  const url=new URL(location.href);url.hash=encodeState(values,selected);history.replaceState(null,'',url);
  try{await navigator.clipboard.writeText(url.href);announce('Diagnosis copied. Send it to someone with a podcast.');}
  catch{announce('Your diagnosis is in the address bar. Copy the link to share it.');}
});
window.addEventListener('hashchange',()=>{({values,selected}=decodeState(location.hash));render();});
$('#reset-view').addEventListener('click',()=>{yaw=-.62;pitch=.49;zoom=1;requestDraw();});
function project(x,d,b){
  const a=x-.5,z=d-.5,y=b-.5;
  const rx=a*Math.cos(yaw)+z*Math.sin(yaw),rz=-a*Math.sin(yaw)+z*Math.cos(yaw);
  const ry=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=y*Math.sin(pitch)+rz*Math.cos(pitch);
  const scale=Math.min(width*(width<500?.68:.55),height*.55)*zoom;
  return {x:width/2+rx*scale*(width>760?1.35:1),y:height*.51-ry*scale,z:depth};
}
function line(points,stroke,lineWidth=1,dash=[]){ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
function label(text,p,color='#809077',size=10,align='center'){const q=project(...p);ctx.fillStyle=color;ctx.font=`${size}px ${size>10?'"Space Grotesk", sans-serif':'ui-monospace, monospace'}`;ctx.textAlign=align;ctx.fillText(text,q.x,q.y);}
function requestDraw(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});}
function draw(){
 if(selected.length!==3||!ctx)return;
 const dpr=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;
 if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 // Light floor and back-wall grid, with deliberately quiet typography.
 for(let i=0;i<=10;i++){let n=i/10;line([[n,0,0],[n,1,0]],'#dfe5d7',.65);line([[0,n,0],[1,n,0]],'#dfe5d7',.65);if(i%2===0){line([[0,1,n],[1,1,n]],'#e9ece3',.6);line([[0,n,0],[0,n,1]],'#e9ece3',.6);}}
 line([[0,0,0],[1,0,0]],'#bac8b0');line([[0,0,0],[0,1,0]],'#bac8b0');line([[0,0,0],[0,0,1]],'#bac8b0');
 // Parameterize the exact contour by brains and yapping, solving for doing.
 const patches=[],n=36;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){
   const points=[];
   for(const [di,dj] of [[0,0],[1,0],[1,1],[0,1]]){
     const b=(j+dj)/n,t=(i+di)/n,minY=.22/(.25+.75*b),y=minY+(1-minY)*t;
     points.push([y,.22/(y*(.25+.75*b)),b]);
   }
   const avg=points.reduce((a,p)=>a+p[2],0)/4;
   patches.push({points,depth:points.reduce((a,p)=>a+project(...p).z,0)/4,avg});
 }
 patches.sort((a,b)=>b.depth-a.depth);
 for(const p of patches){ctx.beginPath();p.points.forEach((a,i)=>{const q=project(...a);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();
   const t=p.avg;const stops=[[216,135,86],[239,214,139],[184,208,129],[91,154,117]];const seg=Math.min(2,Math.floor(t*3)),f=t*3-seg;const rgb=stops[seg].map((v,i)=>Math.round(v+(stops[seg+1][i]-v)*f));
   ctx.fillStyle=`rgba(${rgb.join(',')},0.88)`;ctx.fill();ctx.strokeStyle='rgba(72,105,63,.32)';ctx.lineWidth=.5;ctx.stroke();
 }
 drawArchetypes();
 // The user's location is a real three-axis coordinate, independent of the fictional frontier.
 const point=[values.yapping/100,values.doing/100,values.brains/100],p=project(...point);
 line([[point[0],point[1],0],point],'#bd7b39',1,[3,4]);
 const floor=project(point[0],point[1],0);ctx.beginPath();ctx.ellipse(floor.x,floor.y,6,3,0,0,Math.PI*2);ctx.fillStyle='#b27b3530';ctx.fill();
 ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.fillStyle='#f4aa4e30';ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fillStyle='#e8a05c';ctx.fill();ctx.strokeStyle='#fffdf0';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='#243e31';ctx.font='600 10px "DM Sans", sans-serif';ctx.textAlign='center';ctx.fillText('YOU',p.x,p.y-16);
 label('YAPPING',[.55,-.14,0],colors.yapping,11);label('DOING',[-.19,.55,0],colors.doing,11);label('BRAINS',[-.02,0,1.13],colors.brains,11);
 for(const v of [0,.5,1]){label(String(v*100),[v,-.055,0]);if(v)label(String(v*100),[-.07,v,0]);if(v)label(String(v*100),[-.06,0,v]);}
}
function drawArchetypes(){
 const you=project(values.yapping/100,values.doing/100,values.brains/100);
 const items=archetypes.map((archetype,i)=>({
   ...archetype,button:labelButtons[i],
   anchor:project(archetype.values.yapping/100,archetype.values.doing/100,archetype.values.brains/100),
   w:labelButtons[i].offsetWidth,h:labelButtons[i].offsetHeight
 }));
 const positions=placeLabels(items,width,height,[{x:you.x-18,y:you.y-28,w:36,h:40}]);
 for(const item of positions){
   item.button.style.transform=`translate(${item.x}px,${item.y}px)`;
   const active=keys.every(k=>values[k]===item.values[k]);item.button.setAttribute('aria-pressed',String(active));
   // Leader lines preserve the exact anchor even when text moves for readability.
   const endX=Math.max(item.x,Math.min(item.x+item.w,item.anchor.x));
   const endY=Math.max(item.y,Math.min(item.y+item.h,item.anchor.y));
   ctx.beginPath();ctx.moveTo(item.anchor.x,item.anchor.y);ctx.lineTo(endX,endY);
   ctx.strokeStyle=active?'#bd7b39':'#5f786f80';ctx.lineWidth=1;ctx.stroke();
   ctx.beginPath();ctx.arc(item.anchor.x,item.anchor.y,3,0,Math.PI*2);ctx.fillStyle=active?'#d99045':'#355f4c';ctx.fill();ctx.strokeStyle='#fcfcf8';ctx.lineWidth=1.2;ctx.stroke();
 }
}
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(-.12,Math.min(1.1,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};requestDraw();});
for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.6,zoom-e.deltaY*.001));requestDraw();},{passive:false});
canvas.addEventListener('keydown',e=>{const actions={ArrowLeft:()=>yaw-=.12,ArrowRight:()=>yaw+=.12,ArrowUp:()=>pitch=Math.min(1.1,pitch+.08),ArrowDown:()=>pitch=Math.max(-.12,pitch-.08),'+':()=>zoom=Math.min(1.6,zoom+.1),'=':()=>zoom=Math.min(1.6,zoom+.1),'-':()=>zoom=Math.max(.7,zoom-.1),'0':()=>{yaw=-.62;pitch=.49;zoom=1;}};if(actions[e.key]){e.preventDefault();actions[e.key]();requestDraw();}});
new ResizeObserver(()=>requestDraw()).observe($('#plot'));
function region(x,y,title,lines=[],light=false){return `<g class="map-region" transform="translate(${x} ${y})" ${light?'style="fill:#fffdf2"':''}>${title.split('|').map((t,i)=>`<text class="region-title" y="${i*18}">${t}</text>`).join('')}${lines.map((t,i)=>`<text class="region-copy" y="${title.split('|').length*18+2+i*12}">${t}</text>`).join('')}</g>`;}
function renderMap(){
 const dy=!selected.includes('brains'),db=!selected.includes('yapping');const xkey=dy?'yapping':'brains',ykey=dy||db?'doing':'yapping';
 let labels;
 if(dy)labels=region(18,32,'Stealth mode|since 2023',['Actually builds.','Tells nobody.','Convinced distribution','is beneath them.'],true)+region(204,27,'The workhorse',['Executes nonstop.','No narrative.','Out-networked by worse people.'])+region(413,28,'Insanely “Lucky”',['Builds, yaps, and somehow','always lands the deal, hire,','or timing.'],true)+region(175,133,'The luck-generating|sweet spot',['Ships real things.','Talks about them.','Compounds opportunities.'])+region(416,161,'The narrator',['Excellent at framing.','Mediocre at building.','Still raises.'])+region(24,255,'The idea guy',['Grand vision. No output.','Still “researching.”'])+region(202,255,'The pivot addict',['Ships, then abandons it.','A trail of half-finished projects.'])+region(405,255,'LinkedIn Top Voice',['Maximum distribution.','Minimal substance.','A full-time commentary career.']);
 else if(db)labels=region(20,38,'Criminal|energy',['All boldness. No brains.','Usually ends in handcuffs','or child support.'],true)+region(220,28,'Reckless|chaos',['Big swings. Occasional','jackpots. More often, blowups.','Forbes 30u30'])+region(409,29,'Founder /|empire builder',['Financially dangerous.','(In a good way.)'],true)+region(178,151,'The wealth-building|sweet spot',['Enough courage to act.','Enough brains to avoid stupidity.'])+region(385,246,'Bitter professor /|permanent student',['Understands everything. Does nothing.','Writes 17 blog posts about','why it won’t work.'])+region(90,278,'Helpless, meek, and lost',['No boldness. No brains.','Complains about everything.']);
 else labels=region(20,35,'Confidently|incorrect',['A microphone. A ring light.','Absolutely no sources.'],true)+region(397,35,'Podcast|final boss',['Knows things. Says things.','Three hours per episode.'],true)+region(210,157,'The explainer',['Enough brains to get it.','Enough yap to make it a thread.'])+region(24,269,'Unbothered. Offline.',['No thoughts. No posts.','Living the dream.'])+region(402,264,'Peer-reviewed ghost',['Brilliant insights.','Three impressions.']);
 // Contour artwork follows the shape and region placement of the supplied originals.
 const paths=dy?`<path fill="#eda35e" d="M0 0H600V130Q380 245 260 330H0Z"/><path fill="#f2cc79" d="M170 0H600V100Q350 210 180 330H0V170Q120 170 170 0"/><path fill="#ede79a" d="M250 0H600V75Q340 180 120 260L0 270V205Q175 200 250 0"/><path fill="#c4d981" d="M330 0H600V55Q370 145 220 210L0 250V225Q250 205 330 0"/><path fill="#8ebc74" d="M385 0H600V53Q422 83 312 154Q365 85 385 0"/><path fill="#528b65" d="M420 0H600V38Q450 70 350 125Q403 52 420 0"/>`:`<path fill="#eda35e" d="M185 0H600V44L0 330V240Q135 185 185 0"/><path fill="#f5ca78" d="M266 0H600V21L0 330V280Q205 202 266 0"/><path fill="#eee39b" d="M324 0H600L0 330V302Q255 215 324 0"/><path fill="#c8d782" d="M372 0H600L60 297Q315 195 372 0"/><path fill="#87b472" d="M411 0H600L234 202Q375 107 411 0"/><path fill="#4e8662" d="M444 0H600L345 142Q415 75 444 0"/>`;
 const x=values[xkey]*6,y=330-values[ykey]*3.3;
 map.innerHTML=`<svg viewBox="0 0 600 330" role="img" aria-label="${$('#chart-title').textContent}. ${xkey} increases left to right; ${db?'boldness':ykey} increases bottom to top. Use the sliders or tap the map to move your point."><defs><clipPath id="map-clip"><rect width="600" height="330" rx="2"/></clipPath></defs><g clip-path="url(#map-clip)"><rect width="600" height="330" fill="#d77b67"/>${paths}<path d="${dy?'M0 244 Q170 213 285 188T600 80':'M0 330 600 0'}" stroke="#5b704c" stroke-width="1.2" stroke-dasharray="5 4" fill="none" opacity=".7"/>${labels}</g><rect width="600" height="330" fill="transparent" stroke="#6e7d61" stroke-width="1" class="map-interactive"/><text class="map-axis" x="0" y="346">Low</text><text class="map-axis" x="600" y="346" text-anchor="end">High</text><text class="map-axis-name" x="300" y="354" text-anchor="middle">${xkey==='yapping'?'Yapping (Telling, Distribution, Presence)':'Brains'}</text><text class="map-axis" x="-7" y="9" text-anchor="end">High</text><text class="map-axis" x="-7" y="330" text-anchor="end">Low</text><text class="map-axis-name" transform="translate(-28 165) rotate(-90)" text-anchor="middle">${db?'Boldness':ykey==='doing'?'Doing':'Yapping'}</text><g class="map-marker" transform="translate(${x} ${y})"><circle r="10" fill="#fff8"/><circle r="5" fill="#17372c" stroke="white" stroke-width="2"/><rect x="${x>545?-43:10}" y="${y<25?8:-25}" width="33" height="16" rx="3" fill="#16382e"/><text x="${x>545?-26:26}" y="${y<25?19:-14}" text-anchor="middle" fill="white" font-size="9" font-family="monospace">YOU</text></g></svg>`;
 map.querySelector('svg').addEventListener('click',e=>{
  const svg=e.currentTarget,p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());
  values[xkey]=Math.round(Math.max(0,Math.min(100,q.x/6)));values[ykey]=Math.round(Math.max(0,Math.min(100,100-q.y/3.3)));render();
 });
}
render();

// Re-measure callouts once the self-hosted font metrics are available.
document.fonts.ready.then(requestDraw);
