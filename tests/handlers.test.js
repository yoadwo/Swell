/**
 * Example unit tests for forecast handlers
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/handlers.test.js
 */

import { handleGetForecastRequest } from '../src/app-side/handlers.js';
import { test } from "node:test";
import assert from "node:assert/strict";

// Mock storage
class MockStorage {
  constructor(data = {}) {
    this.data = data;
  }
  
  setItem(key, value) {
    this.data[key] = value;
  }
  
  getItem(key) {
    return this.data[key] || null;
  }
}

// Tests for handleGetForecastRequest
console.log('\n=== Forecast Handler Tests ===');

test('Returns null when no beach selected', () => {
  const storage = new MockStorage();
  const payload = handleGetForecastRequest(storage);
  assert(payload === null, 'Should return null when no beach selected');
});

test('Returns payload with selected beach from storage', () => {
  const selectedBeach = { name: 'Bat Yam', lat: 32.015, lon: 34.74 };
  const storage = new MockStorage({
    'selectedBeach': JSON.stringify(selectedBeach),
  });
  
  const payload = handleGetForecastRequest(storage);
  assert(payload !== null, 'Should return payload when beach is selected');
  assert.equal(payload.beach, 'Bat Yam', 'Should use beach from storage');
});

test('Returns payload with hourly data', () => {
  const selectedBeach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
  const storage = new MockStorage({
    'selectedBeach': JSON.stringify(selectedBeach),
  });
  
  const payload = handleGetForecastRequest(storage);
  assert(payload !== null, 'Should have payload');
  assert(Array.isArray(payload.hourly), 'Hourly should be array');
  assert.equal(payload.hourly.length, 24, 'Should have 24 hours of data');
  assert(payload.hourly[0].time !== undefined, 'Hourly entries should have time');
  assert(payload.hourly[0].waveHeight !== undefined, 'Hourly entries should have waveHeight');
  assert(payload.hourly[0].score !== undefined, 'Hourly entries should have score');
});

test('Returns payload with current conditions', () => {
  const selectedBeach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
  const storage = new MockStorage({
    'selectedBeach': JSON.stringify(selectedBeach),
  });
  
  const payload = handleGetForecastRequest(storage);
  assert(payload !== null, 'Should have payload');
  
  const current = payload.current;
  assert(current.waveHeight !== undefined, 'Should have waveHeight');
  assert(current.wavePeriod !== undefined, 'Should have wavePeriod');
  assert(current.waveDirection !== undefined, 'Should have waveDirection');
  assert(current.windSpeed !== undefined, 'Should have windSpeed');
  assert(current.windDirection !== undefined, 'Should have windDirection');
  assert(current.waterTemp !== undefined, 'Should have waterTemp');
});

test('Returns null when storage is not available', () => {
  const payload = handleGetForecastRequest(null);
  assert(payload === null, 'Should return null when storage is null');
});

test('Returns null when beach data is corrupted', () => {
  const storage = new MockStorage({
    'selectedBeach': 'invalid json {',
  });
  
  const payload = handleGetForecastRequest(storage);
  assert(payload === null, 'Should return null on parse error');
});

test('Current waveHeight matches first hourly waveHeight', () => {
  const selectedBeach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
  const storage = new MockStorage({
    'selectedBeach': JSON.stringify(selectedBeach),
  });
  
  const payload = handleGetForecastRequest(storage);
  assert(payload !== null, 'Should have payload');
  assert.equal(
    payload.current.waveHeight,
    payload.hourly[0].waveHeight,
    'Current wave height should match first hourly value'
  );
});

console.log('\n=== All tests completed ===');
