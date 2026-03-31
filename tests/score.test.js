/**
 * Example unit tests for separated logic
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ..tests/score.test.js
 */

import { getTrafficLightState, formatScore } from '../src/page/score.js';
import { test } from "node:test";
import assert from "node:assert/strict";

// Tests for getTrafficLightState
console.log('\n=== Traffic Light State Tests ===');

test('Green state for score 10', () => {
  const state = getTrafficLightState(10);
  assert.equal(state.color, 0x00FF00, 'Color should be green');
  assert.equal(state.text, 'Go Crazy', 'Text should be "Go Crazy"');
  assert.equal(state.icon, '🏄', 'Icon should be surfboard');
});

test('Green state for score 7 (boundary)', () => {
  const state = getTrafficLightState(7);
  assert.equal(state.color, 0x00FF00, 'Color should be green');
});

test('Yellow state for score 5 (mid-range)', () => {
  const state = getTrafficLightState(5);
  assert.equal(state.color, 0xFFFF00, 'Color should be yellow');
  assert.equal(state.text, 'Have Fun', 'Text should be "Have Fun"');
  assert.equal(state.icon, '🌊', 'Icon should be wave');
});

test('Yellow state for score 4 (boundary)', () => {
  const state = getTrafficLightState(4);
  assert.equal(state.color, 0xFFFF00, 'Color should be yellow');
});

test('Red state for score 0', () => {
  const state = getTrafficLightState(0);
  assert.equal(state.color, 0xFF0000, 'Color should be red');
  assert.equal(state.text, 'Better Get Coffee', 'Text should be "Better Get Coffee"');
  assert.equal(state.icon, '☕', 'Icon should be coffee');
});

test('Red state for score 3 (boundary)', () => {
  const state = getTrafficLightState(3);
  assert.equal(state.color, 0xFF0000, 'Color should be red');
});

test('Clamps negative scores to 0', () => {
  const state = getTrafficLightState(-5);
  assert.equal(state.color, 0xFF0000, 'Negative score should clamp to red');
});

test('Clamps scores above 10', () => {
  const state = getTrafficLightState(15);
  assert.equal(state.color, 0x00FF00, 'Score > 10 should clamp to green');
});

// Tests for formatScore
console.log('\n=== Format Score Tests ===');

test('Formats positive score with decimal', () => {
  const result = formatScore(8.567);
  assert.equal(result, '8.6', 'Should format to 1 decimal place');
});

test('Formats score 0', () => {
  const result = formatScore(0);
  assert.equal(result, '0.0', 'Should format 0 as 0.0');
});

test('Handles null score', () => {
  const result = formatScore(null);
  assert.equal(result, '-', 'Should return "-" for null');
});

test('Handles undefined score', () => {
  const result = formatScore(undefined);
  assert.equal(result, '-', 'Should return "-" for undefined');
});

test('Formats score 10', () => {
  const result = formatScore(10);
  assert.equal(result, '10.0', 'Should format 10 as 10.0');
});

console.log('\n=== All tests completed ===');
