import {keys,diagnose,encodeState} from './model.js';
import {closestArchetype,placeLabels} from './archetypes.js';
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
  ctx.fillStyle='#71806a';ctx.font='18px monospace';ctx.fillText('MY CLOSEST ARCHETYPE',56,131);
  let titleSize=92,titleLines;
  do{ctx.font=`700 ${titleSize}px "Space Grotesk", sans-serif`;titleLines=wrap(ctx,details.match.label,1088);if(titleLines.length<=2)break;titleSize-=2;}while(titleSize>64);
  const titleLineHeight=titleSize+5;
  ctx.fillStyle='#18362e';titleLines.forEach((line,i)=>ctx.fillText(line,56,228+i*titleLineHeight));
  ctx.font='500 38px "DM Sans", sans-serif';ctx.fillStyle='#365a43';
  const roastY=228+(titleLines.length-1)*titleLineHeight+66;
  const roastLines=wrap(ctx,details.roast,1088);
  roastLines.forEach((line,i)=>ctx.fillText(line,56,roastY+i*47));
  const scoresY=roastY+(roastLines.length-1)*47+68;
  const activeNames=selected.map(k=>k[0].toUpperCase()+k.slice(1)).join(' + ');
  ctx.font='14px monospace';ctx.fillStyle='#75816b';ctx.fillText(`MATCHED ON: ${activeNames.toUpperCase()}`,56,scoresY-21);
  keys.forEach((key,i)=>{
    const x=56+i*371,on=selected.includes(key);
    rounded(ctx,x,scoresY,346,112,12,on?'#edf1e4':'#f2f2ec','#d8e0cc');
    ctx.fillStyle=on?'#18362e':'#89917e';ctx.font='500 21px "Space Grotesk", sans-serif';ctx.fillText(key.toUpperCase(),x+22,scoresY+38);
    ctx.font='600 46px "Space Grotesk", sans-serif';ctx.fillText(String(values[key]),x+22,scoresY+89);
    ctx.font='15px monospace';ctx.fillText(on?'/ 100':'/ 100 · NOT IN MATCH',x+110,scoresY+82);
  });
  const chartY=scoresY+140;
  rounded(ctx,36,chartY,1128,1280-chartY,18,'#fcfcf8','#dce1d5');
  ctx.fillStyle='#78876d';ctx.font='14px monospace';ctx.fillText('JUST ME AND MY NEAREST BAD INFLUENCE',60,chartY+33);
  ctx.save();ctx.translate(50,chartY+50);
  const plotWidth=1100,plotHeight=1230-chartY-50;
  const project=drawSurface(ctx,{width:plotWidth,height:plotHeight,values,...camera,zoom:1,stretch:1.25,userLabelSize:27});
  const you=project(values.yapping/100,values.doing/100,values.brains/100);
  const match=details.match;
  ctx.font='600 25px "Space Grotesk", sans-serif';
  const lines=wrap(ctx,match.label,300);
  const item={...match,lines,w:Math.max(...lines.map(l=>ctx.measureText(l).width))+32,h:lines.length*30+46,anchor:project(match.values.yapping/100,match.values.doing/100,match.values.brains/100)};
  const [placed]=placeLabels([item],plotWidth,plotHeight,[{x:you.x-40,y:you.y-58,w:80,h:78}]);
  ctx.beginPath();ctx.moveTo(placed.anchor.x,placed.anchor.y);ctx.lineTo(Math.max(placed.x,Math.min(placed.x+placed.w,placed.anchor.x)),Math.max(placed.y,Math.min(placed.y+placed.h,placed.anchor.y)));ctx.strokeStyle='#365a43';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(placed.anchor.x,placed.anchor.y,5,0,Math.PI*2);ctx.fillStyle='#294f3e';ctx.fill();ctx.strokeStyle='#fcfcf8';ctx.lineWidth=2;ctx.stroke();
  rounded(ctx,placed.x,placed.y,placed.w,placed.h,10,'#234d39');
  ctx.textAlign='center';ctx.font='13px monospace';ctx.fillStyle='#dfff83';ctx.fillText('CLOSEST MATCH',placed.x+placed.w/2,placed.y+24);
  ctx.font='600 25px "Space Grotesk", sans-serif';ctx.fillStyle='#eff8dc';
  placed.lines.forEach((line,i)=>ctx.fillText(line,placed.x+placed.w/2,placed.y+53+i*30));ctx.textAlign='left';
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
