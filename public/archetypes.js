import {presets,keys} from './model.js';

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

// Equal-weight Euclidean distance in the selected 0–100 trait coordinates.
// Stable list order breaks exact ties so results never flicker.
export function closestArchetype(values,selected=keys) {
  const axes=keys.filter(key=>selected.includes(key));
  if(!axes.length)throw new Error('Select at least one trait');
  let closest=null;
  for(const archetype of archetypes){
    const squaredDistance=axes.reduce((sum,key)=>sum+(values[key]-archetype.values[key])**2,0);
    if(!closest||squaredDistance<closest.squaredDistance)closest={...archetype,squaredDistance};
  }
  return {...closest,distance:Math.sqrt(closest.squaredDistance)};
}

// Choose the nearest clear spot for each readable, camera-facing label.
// Anchors stay fixed in world space; only the callout shifts to avoid collisions.
export function placeLabels(items,width,height,obstacles=[]) {
  const placed=[],padding=12,top=40,bottom=36,gap=width<500?9:16;
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w+gap,b.x+b.w+gap)-Math.max(a.x-gap,b.x-gap))*Math.max(0,Math.min(a.y+a.h+gap,b.y+b.h+gap)-Math.max(a.y-gap,b.y-gap));
  for(const item of items){
    let best=null;
    for(const radius of [48,75,105,145,190,245,310,390,470])for(let i=0;i<16;i++){
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
