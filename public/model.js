import {luckScore} from './surface.js';
export const keys = ['doing','yapping','brains'];
export const presets = {
  stealth:{doing:92,yapping:8,brains:75},
  voice:{doing:8,yapping:96,brains:45},
  professor:{doing:12,yapping:27,brains:96},
  lucky:{doing:88,yapping:88,brains:82}
};
export function decodeState(hash='') {
  const params=new URLSearchParams(hash.replace(/^#/,''));
  const values={doing:65,yapping:75,brains:60};
  for(const k of keys){const raw=params.get(k); if(raw!==null && raw.trim()!=='' && Number.isFinite(Number(raw))) values[k]=Math.round(Math.max(0,Math.min(100,Number(raw))));}
  const selected=(params.get('axes')||'').split(',').filter((k,i,a)=>keys.includes(k)&&a.indexOf(k)===i);
  return {values,selected:selected.length>=2?keys.filter(k=>selected.includes(k)):[...keys]};
}
export function encodeState(values,selected){const p=new URLSearchParams();for(const k of keys)p.set(k,String(values[k]));p.set('axes',selected.join(','));return p.toString();}
export function toggleDimension(selected,key){if(!keys.includes(key))return selected;if(selected.includes(key))return selected.length>2?selected.filter(k=>k!==key):selected;return keys.filter(k=>k===key||selected.includes(k));}
export function potential({doing:d,yapping:y,brains:b},selected=keys){
  if(selected.length===2){const [a,c]=selected;return Math.round(Math.sqrt(dimensionValue(a)*dimensionValue(c)));}
  return Math.round(100*luckScore(d/100,y/100,b/100));
  function dimensionValue(k){return {doing:d,yapping:y,brains:b}[k];}
}
export function diagnose(v,selected=keys){
  const {doing:d,yapping:y,brains:b}=v;
  const result=(title,copy)=>({title,copy,energy:potential(v,selected)});
  if(selected.length===2&&!selected.includes('doing')){
    if(y>65&&b<35)return result('Confidently incorrect','You have a microphone, a ring light, and absolutely no follow-up questions.');
    if(y<35&&b>65)return result('Peer-reviewed ghost','Your insights are incredible. The three people who saw them agree.');
    if(y>65&&b>65)return result('Podcast final boss','You can explain anything. Usually in a three-hour episode.');
    if(y<35&&b<35)return result('Unbothered. Offline.','No thoughts, no posts. Somehow the healthiest person here.');
    return result('The explainer','You understand things AND tell people. Please resist starting a newsletter.');
  }
  if(selected.length===2&&!selected.includes('yapping')){
    if(d<30&&b>62)return result('Bitter professor / permanent student','Understands everything. Does nothing. Writes 17 blog posts about why it won’t work.');
    if(d>65&&b<27)return result('Criminal energy','All boldness. No brains. The compliance department has muted you.');
    if(d>72&&b<57)return result('Reckless chaos','Big swings. Occasional jackpots. More often, blowups. Forbes 30u30 energy.');
    if(d>65&&b>65)return result('Founder / empire builder','Financially dangerous. In a good way. Actually takes the shot.');
    if(d<30&&b<30)return result('Helpless, meek, and lost','No boldness. No brains. Somehow still has feedback for everyone else.');
    return result('The wealth-building sweet spot','Enough courage to act. Enough brains to avoid stupidity. A rare combination.');
  }
  if(d>65&&y<30)return result('Stealth mode since 2023','Actually builds. Tells nobody. Convinced distribution is beneath them.');
  if(d<30&&y>70)return result('LinkedIn Top Voice','Maximum distribution. Minimal substance. A full-time commentary career.');
  if(selected.length===3&&d<30&&b>75)return result('Bitter professor / permanent student','Knows 19 reasons it won’t work. Has tried exactly zero of them.');
  if(selected.length===3&&d>75&&b<25)return result('Reckless chaos','Your execution is world-class. Your risk assessment is a shrug emoji.');
  if(d<30&&y<30)return result('The idea guy','Grand vision. No output. Still “researching.” The domain name is excellent though.');
  if(d>76&&y>76)return result('Insanely “lucky”','Builds, yaps, and somehow always lands the deal, hire, or timing. Must be luck.');
  if(d>76&&y<65)return result('The workhorse','Executes nonstop. No narrative. Gets out-networked by worse people.');
  if(y>70&&d<63)return result('The narrator','Excellent at framing. Mediocre at building. Still raises.');
  if(d<38)return result('The pivot addict','Ships, then immediately abandons it for the next thing. A trail of half-finished projects.');
  return result('The luck-generating sweet spot','Ships real things. Talks about them. Compounds opportunities. Suspiciously effective.');
}
