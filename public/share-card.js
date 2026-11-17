import {keys,diagnose,encodeState} from './model.js';
import {archetypes,closestArchetype,placeLabels} from './archetypes.js';
import {drawSurface} from './surface.js';

export function cardDetails(values,selected){
  const match=closestArchetype(values,selected);
  return {match,roast:diagnose(match.values).copy,values:{...values},selected:[...selected],filename:`luck-surface-${match.id}-${values.doing}-${values.yapping}-${values.brains}.png`,url:`https://the-luck-surface.vercel.app/#${encodeState(values,selected)}`};
}
function wrap(ctx,text,maxWidth){
  const lines=[];let line='';
  for(const word of text.split(' ')){
    const next=line?line+' '+word:word;
    if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);return lines;
}
function rounded(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
export async function createShareCard(values,selected,camera={}){
  const details=cardDetails(values,selected);
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.fillStyle='#f7f8f2';ctx.fillRect(0,0,1200,1500);
  ctx.fillStyle='#18362e';ctx.font='600 22px "Space Grotesk", sans-serif';ctx.fillText('THE LUCK SURFACE',56,63);
  ctx.font='14px monospace';ctx.textAlign='right';ctx.fillText('PERSONALITY AUDIT / NO REFUNDS',1144,61);ctx.textAlign='left';
  ctx.fillStyle='#dce1d5';ctx.fillRect(56,88,1088,1);
  ctx.fillStyle='#71806a';ctx.font='15px monospace';ctx.fillText('MY CLOSEST ARCHETYPE',56,126);
  let titleSize=64,titleLines;
  do{ctx.font=`600 ${titleSize}px "Space Grotesk", sans-serif`;titleLines=wrap(ctx,details.match.label,1088);if(titleLines.length<=2)break;titleSize-=2;}while(titleSize>40);
  ctx.fillStyle='#18362e';titleLines.forEach((line,i)=>ctx.fillText(line,56,197+i*(titleSize+5)));
  ctx.font='24px "DM Sans", sans-serif';ctx.fillStyle='#5e715a';
  const roastY=titleLines.length>1?318:285;
  wrap(ctx,details.roast,1088).forEach((line,i)=>ctx.fillText(line,56,roastY+i*32));
  const activeNames=selected.map(k=>k[0].toUpperCase()+k.slice(1)).join(' + ');
  ctx.font='14px monospace';ctx.fillStyle='#75816b';ctx.fillText(`MATCHED ON: ${activeNames.toUpperCase()}`,56,369);
  keys.forEach((key,i)=>{
    const x=56+i*371,on=selected.includes(key);
    rounded(ctx,x,395,346,112,12,on?'#edf1e4':'#f2f2ec','#d8e0cc');
    ctx.fillStyle=on?'#18362e':'#89917e';ctx.font='500 21px "Space Grotesk", sans-serif';ctx.fillText(key.toUpperCase(),x+22,433);
    ctx.font='600 46px "Space Grotesk", sans-serif';ctx.fillText(String(values[key]),x+22,484);
    ctx.font='15px monospace';ctx.fillText(on?'/ 100':'/ 100 · NOT IN MATCH',x+110,477);
  });
  rounded(ctx,36,535,1128,745,18,'#fcfcf8','#dce1d5');
  ctx.fillStyle='#78876d';ctx.font='14px monospace';ctx.fillText('MY POSITION IN THE HUMAN POTENTIAL MARKET',60,568);
  ctx.save();ctx.translate(50,585);
  const plotWidth=1100,plotHeight=650;
  const project=drawSurface(ctx,{width:plotWidth,height:plotHeight,values,...camera,zoom:1,stretch:1.25});
  const you=project(values.yapping/100,values.doing/100,values.brains/100);
  ctx.font='500 17px "Space Grotesk", sans-serif';
  const items=archetypes.map(a=>{const lines=wrap(ctx,a.label,188);return {...a,lines,w:Math.min(212,Math.max(...lines.map(l=>ctx.measureText(l).width))+24),h:lines.length*21+20,anchor:project(a.values.yapping/100,a.values.doing/100,a.values.brains/100)};});
  for(const item of placeLabels(items,plotWidth,plotHeight,[{x:you.x-24,y:you.y-35,w:48,h:55}])){
    const nearest=item.id===details.match.id;
    ctx.beginPath();ctx.moveTo(item.anchor.x,item.anchor.y);ctx.lineTo(Math.max(item.x,Math.min(item.x+item.w,item.anchor.x)),Math.max(item.y,Math.min(item.y+item.h,item.anchor.y)));ctx.strokeStyle='#6a7d6688';ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();ctx.arc(item.anchor.x,item.anchor.y,3.5,0,Math.PI*2);ctx.fillStyle='#294f3e';ctx.fill();
    rounded(ctx,item.x,item.y,item.w,item.h,7,nearest?'#234d39':'#fcfcf8f2',nearest?'#234d39':'#becdb6');
    ctx.font='500 17px "Space Grotesk", sans-serif';ctx.textAlign='center';ctx.fillStyle=nearest?'#eff8dc':'#254c3b';
    item.lines.forEach((line,i)=>ctx.fillText(line,item.x+item.w/2,item.y+24+i*21));ctx.textAlign='left';
  }
  ctx.restore();
  ctx.font='15px monospace';ctx.fillStyle='#75816b';ctx.fillText('RED = COOKED     AMBER = GETTING THERE     GREEN = SUSPICIOUSLY LUCKY',60,1252);
  ctx.fillStyle='#18362e';ctx.font='500 26px "Space Grotesk", sans-serif';ctx.fillText('100% vibes. 0% grounds for a promotion.',56,1326);
  ctx.fillStyle='#dce1d5';ctx.fillRect(56,1354,1088,1);
  ctx.fillStyle='#18362e';ctx.font='500 21px "DM Sans", sans-serif';ctx.fillText('Original memes: Lauris (@lzminsky)',56,1395);
  ctx.fillStyle='#75816b';ctx.font='14px monospace';ctx.fillText('x.com/lzminsky/status/2122721739289346380',56,1422);
  ctx.font='18px "DM Sans", sans-serif';ctx.fillStyle='#365a43';ctx.textAlign='right';ctx.fillText('the-luck-surface.vercel.app',1144,1395);
  ctx.font='14px monospace';ctx.fillStyle='#75816b';ctx.fillText('UNOFFICIAL REMIX · SATIRE, NOT SCIENCE',1144,1422);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png'));
  return {...details,blob};
}
