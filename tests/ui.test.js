/**
 * Unit tests for UI formatting helpers
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/ui.test.js
 */

import { formatDirection } from '../src/page/ui-helpers.js';
import { test } from "node:test";
import assert from "node:assert/strict";

test('Direction Formatting', async (t) => {
  await t.test('Returns "-" for null direction', () => {
    assert.equal(formatDirection(null), '-');
    assert.equal(formatDirection(undefined), '-');
  });

  await t.test('Swell direction shows "where its from" (no adjustment)', () => {
    // Swell from 270° (W) should show W with left arrow
    assert.equal(formatDirection(270, false), 'W(←)');
    
    // Swell from 180° (S) should show S with down arrow  
    assert.equal(formatDirection(180, false), 'S(↓)');
    
    // Swell from 90° (E) should show E with right arrow
    assert.equal(formatDirection(90, false), 'E(→)');
    
    // Swell from 0° (N) should show N with up arrow
    assert.equal(formatDirection(0, false), 'N(↑)');
  });

  await t.test('Wind direction shows "where its going to" (flipped 180°)', () => {
    // Wind from 180° (S) blows to 180+180=360° (N), arrow should point up
    assert.equal(formatDirection(180, true), 'N(↑)');
    
    // Wind from 90° (E) blows to 90+180=270° (W), arrow should point left
    assert.equal(formatDirection(90, true), 'W(←)');
    
    // Wind from 270° (W) blows to 270+180=450%360=90° (E), arrow should point right
    assert.equal(formatDirection(270, true), 'E(→)');
    
    // Wind from 0° (N) blows to 0+180=180° (S), arrow should point down
    assert.equal(formatDirection(0, true), 'S(↓)');
  });

  await t.test('Cardinal directions round correctly', () => {
    // 45° → NE
    assert.equal(formatDirection(45, false), 'NE(↗)');
    assert.equal(formatDirection(45, true), 'SW(↙)');
    
    // 315° (-45°) → NW
    assert.equal(formatDirection(315, false), 'NW(↖)');
    assert.equal(formatDirection(315, true), 'SE(↘)');
  });
});