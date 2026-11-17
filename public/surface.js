// Shared by the interactive chart and PNG cards: one geometry and colour scale.
// This is a fictional balanced-trait reference, not a fitted model of people.
export const palette = [[0,[201,52,49]],[.25,[233,103,48]],[.5,[246,204,73]],[.72,[127,184,77]],[1,[20,121,71]]];
export function luckScore(doing,yapping,brains){
  return Math.cbrt(doing*yapping*(.25+.75*brains));
}
export function surfaceBrains(doing,yapping){return Math.sqrt(doing*yapping);}
export function surfaceColor(score){
  const t=Math.max(0,Math.min(1,score));
  const i=palette.findIndex(([stop])=>stop>=t);
  if(i<=0)return [...palette[0][1]];
  const [lo,a]=palette[i-1],[hi,b]=palette[i],f=(t-lo)/(hi-lo);
  return a.map((v,k)=>Math.round(v+(b[k]-v)*f));
}
export function projection(width,height,{yaw=-.62,pitch=.18,zoom=1,stretch=width>760?1.35:1}={}){
  const scale=Math.min(width*(width<500?.68:.55),height*.55)*zoom;
  return (x,d,b)=>{
    const a=x-.5,z=d-.5,y=b-.5;
    const rx=a*Math.cos(yaw)+z*Math.sin(yaw),rz=-a*Math.sin(yaw)+z*Math.cos(yaw);
    return {x:width/2+rx*scale*stretch,y:height*.51-(y*Math.cos(pitch)-rz*Math.sin(pitch))*scale,z:y*Math.sin(pitch)+rz*Math.cos(pitch)};
  };
}
const mesh=[];
for(let i=0;i<40;i++)for(let j=0;j<40;j++){
  const points=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([x,d])=>[x/40,d/40,surfaceBrains(d/40,x/40)]);
  const d=(j+.5)/40,y=(i+.5)/40;
  mesh.push({points,color:surfaceColor(luckScore(d,y,surfaceBrains(d,y)))});
}
export function drawSurface(ctx,{width,height,values,...camera}){
  const project=projection(width,height,camera);
  const line=(points,stroke,lineWidth=1,dash=[])=>{
    ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});
    ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
  };
  ctx.save();ctx.lineJoin='round';
  // Ground grid and a faint cube for actual Doing / Yapping / Brains coordinates.
  for(let i=0;i<=10;i++){const n=i/10;line([[n,0,0],[n,1,0]],'#dce3d6',.7);line([[0,n,0],[1,n,0]],'#dce3d6',.7);}
  line([[0,0,0],[0,0,1]],'#aebda9');line([[0,0,0],[1,0,0]],'#aebda9');line([[0,0,0],[0,1,0]],'#aebda9');
  line([[0,0,1],[0,1,1],[1,1,1],[1,0,1],[0,0,1]],'#dce3d680',.7);
  const patches=mesh.map(p=>({...p,depth:p.points.reduce((a,q)=>a+project(...q).z,0)/4})).sort((a,b)=>b.depth-a.depth);
  for(const patch of patches){
    ctx.beginPath();patch.points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();
    ctx.fillStyle=`rgb(${patch.color.join(',')})`;ctx.fill();
    ctx.strokeStyle='rgba(31,60,39,.18)';ctx.lineWidth=.55;ctx.stroke();
  }
  const label=(text,point,color='#75866b',size=10)=>{
    const p=project(...point);ctx.font=`${size}px ${size>10?'"Space Grotesk", sans-serif':'monospace'}`;
    ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,p.x,p.y);
  };
  label('YAPPING',[.55,-.14,0],'#9b6b2f',12);label('DOING',[-.19,.55,0],'#3e7955',12);label('BRAINS',[-.02,0,1.13],'#85639e',12);
  for(const v of [0,.5,1]){label(String(v*100),[v,-.055,0]);if(v)label(String(v*100),[-.07,v,0]);if(v)label(String(v*100),[-.06,0,v]);}
  const point=[values.yapping/100,values.doing/100,values.brains/100],p=project(...point);
  line([[point[0],point[1],0],point],'#233e32',1.3,[4,4]);
  ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.fillStyle='#ffffff70';ctx.fill();
  ctx.beginPath();ctx.arc(p.x,p.y,5.5,0,Math.PI*2);ctx.fillStyle='#182f28';ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
  ctx.textAlign='center';ctx.font='700 12px "DM Sans", sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#fcfcf8';ctx.strokeText('YOU',p.x,p.y-17);ctx.fillStyle='#18362e';ctx.fillText('YOU',p.x,p.y-17);
  ctx.restore();
  return project;
}
