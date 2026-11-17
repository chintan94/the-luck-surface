import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeState,encodeState,toggleDimension,keys,diagnose,presets,potential} from '../public/model.js';
test('shared URLs round-trip every two-axis view and the full surface',()=>{
 for(const axes of [keys,['doing','yapping'],['doing','brains'],['yapping','brains']]){
  assert.deepEqual(decodeState(encodeState(presets.lucky,axes)),{values:presets.lucky,selected:axes});
 }
});
test('untrusted hash values cannot corrupt coordinates or dimensions',()=>{
 const s=decodeState('#doing=NaN&yapping=999&brains=-40&axes=garbage,doing,doing');
 assert.deepEqual(s,{values:{doing:65,yapping:100,brains:0},selected:keys});
 assert.equal(decodeState('#doing=').values.doing,65);
});
test('at least two unique dimensions are always selected',()=>{
 const pair=toggleDimension(keys,'brains');assert.deepEqual(pair,['doing','yapping']);assert.equal(toggleDimension(pair,'doing'),pair);assert.deepEqual(toggleDimension(pair,'brains'),keys);
});
test('original two-axis archetypes do not depend on the excluded dimension',()=>{
 assert.equal(diagnose(presets.stealth,['doing','yapping']).title,'Stealth mode since 2023');
 assert.equal(diagnose(presets.voice,['doing','yapping']).title,'LinkedIn Top Voice');
 assert.equal(diagnose(presets.professor,['doing','brains']).title,'Bitter professor / permanent student');
 assert.deepEqual(diagnose({...presets.voice,brains:0},['doing','yapping']),diagnose({...presets.voice,brains:100},['doing','yapping']));
});
test('satirical energy stays finite at all corners and modes',()=>{
 for(const doing of [0,100])for(const yapping of [0,100])for(const brains of [0,100])for(const axes of [keys,['doing','yapping'],['doing','brains'],['yapping','brains']]){
  const score=potential({doing,yapping,brains},axes);assert.ok(Number.isFinite(score)&&score>=0&&score<=100);
 }
});
