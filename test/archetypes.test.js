import test from 'node:test';
import assert from 'node:assert/strict';
import {archetypes,closestArchetype} from '../public/archetypes.js';

test('each labelled archetype returns itself at its exact coordinates',()=>{
  for(const archetype of archetypes){
    const match=closestArchetype(archetype.values);
    assert.equal(match.id,archetype.id);
    assert.equal(match.distance,0);
  }
});
test('nearby input returns a nearest neighbour, not a broad diagnosis region',()=>{
  const match=closestArchetype({doing:10,yapping:94,brains:43});
  assert.equal(match.id,'voice');
  assert.equal(match.squaredDistance,12);
});
test('deselected traits do not affect the closest archetype',()=>{
  for(const axes of [['doing','yapping'],['doing','brains'],['yapping','brains']]){
    const omitted=['doing','yapping','brains'].find(k=>!axes.includes(k));
    assert.deepEqual(closestArchetype({doing:35,yapping:65,brains:50,[omitted]:0},axes),closestArchetype({doing:35,yapping:65,brains:50,[omitted]:100},axes));
  }
});
test('corner inputs have a finite result and camera-independent distance',()=>{
  for(const doing of [0,100])for(const yapping of [0,100])for(const brains of [0,100]){
    const match=closestArchetype({doing,yapping,brains});
    assert.ok(archetypes.some(a=>a.id===match.id));
    assert.ok(Number.isFinite(match.distance));
  }
});
