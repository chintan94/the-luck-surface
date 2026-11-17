import test from 'node:test';
import assert from 'node:assert/strict';
import {luckScore,surfaceBrains,surfaceColor} from '../public/surface.js';
import {cardDetails} from '../public/share-card.js';
import {decodeState,keys} from '../public/model.js';
import {archetypes} from '../public/archetypes.js';

test('colours reward a balanced mix, not intelligence alone',()=>{
  assert.equal(luckScore(0,1,1),0);
  assert.equal(luckScore(1,0,1),0);
  assert.ok(luckScore(.8,.8,.8)>luckScore(.1,.1,1));
  assert.ok(luckScore(.8,.8,.9)>luckScore(.8,.8,.1));
  assert.deepEqual(surfaceColor(0),[201,52,49]);
  assert.deepEqual(surfaceColor(1),[20,121,71]);
});
test('reference landscape and colours remain finite at every grid corner',()=>{
  for(let d=0;d<=10;d++)for(let y=0;y<=10;y++){
    const b=surfaceBrains(d/10,y/10),score=luckScore(d/10,y/10,b);
    assert.ok(b>=0&&b<=1&&score>=0&&score<=1);
    assert.ok(surfaceColor(score).every(channel=>Number.isFinite(channel)&&channel>=0&&channel<=255));
  }
});
test('card snapshots keep scores, nearest match and share link consistent',()=>{
  for(const archetype of archetypes){
    const values={...archetype.values},selected=[...keys],card=cardDetails(values,selected);
    values.doing=0;selected.pop();
    assert.equal(card.match.id,archetype.id);
    assert.deepEqual(card.values,archetype.values);
    assert.deepEqual(decodeState(new URL(card.url).hash),{values:archetype.values,selected:keys});
    assert.ok(card.filename.endsWith('.png'));
  }
});
test('two-axis exports retain all scores and identify excluded traits',()=>{
  const values={doing:8,yapping:96,brains:100},selected=['doing','yapping'];
  const card=cardDetails(values,selected);
  assert.equal(card.match.id,'voice');
  assert.equal(card.values.brains,100);
  assert.deepEqual(card.selected,selected);
});
