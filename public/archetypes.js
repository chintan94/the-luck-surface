import {presets} from './model.js';

// Real trait coordinates, shared with presets where available. These mark people
// in the 3D space; they need not lie on the fictional equal-luck contour.
export const archetypes = [
  {id:'voice',label:'LinkedIn Top Voice',values:presets.voice},
  {id:'stealth',label:'Stealth mode since 2023',values:presets.stealth},
  {id:'professor',label:'Bitter professor / permanent student',values:presets.professor},
  {id:'lucky',label:'Insanely “lucky”',values:presets.lucky},
  {id:'workhorse',label:'The workhorse',values:{doing:91,yapping:45,brains:65}},
  {id:'narrator',label:'The narrator',values:{doing:43,yapping:88,brains:53}},
  {id:'idea',label:'The idea guy',values:{doing:14,yapping:16,brains:22}},
  {id:'pivot',label:'The pivot addict',values:{doing:32,yapping:53,brains:36}},
  {id:'chaos',label:'Reckless chaos',values:{doing:91,yapping:69,brains:12}},
  {id:'sweet',label:'The luck-generating sweet spot',values:{doing:64,yapping:63,brains:61}}
];

// Choose the nearest clear spot for each readable, camera-facing label.
// Anchors stay fixed in world space; only the callout shifts to avoid collisions.
export function placeLabels(items,width,height,obstacles=[]) {
  const placed=[],padding=8,top=36,bottom=28;
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w+4,b.x+b.w+4)-Math.max(a.x-4,b.x-4))*Math.max(0,Math.min(a.y+a.h+4,b.y+b.h+4)-Math.max(a.y-4,b.y-4));
  for(const item of items){
    let best=null;
    for(const radius of [18,40,65,95,130,175,225])for(let i=0;i<16;i++){
      const angle=i*Math.PI/8;
      const x=Math.max(padding,Math.min(width-item.w-padding,item.anchor.x+Math.cos(angle)*radius-item.w/2));
      const y=Math.max(top,Math.min(height-item.h-bottom,item.anchor.y+Math.sin(angle)*radius-item.h/2));
      const box={x,y,w:item.w,h:item.h};
      const distance=(x+item.w/2-item.anchor.x)**2+(y+item.h/2-item.anchor.y)**2;
      const collision=[...placed,...obstacles].reduce((sum,other)=>sum+overlap(box,other),0);
      const score=distance+collision*150;
      if(!best||score<best.score)best={...box,score};
    }
    placed.push({...item,...best});
  }
  return placed;
}
