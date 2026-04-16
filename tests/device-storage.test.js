/**
 * Unit tests for device storage logic
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/device-storage.test.js
 */

import { saveForecast, loadForecast } from '../src/utils/device-storage.js';
import { test } from "node:test";
import assert from "node:assert/strict";

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

const mockPayload = {
  beach: "Frishman",
  score: 8.5,
  updatedAt: 1700000000,
  current: {
    swell: { height: 1.5, period: 12, direction: 270 },
    wind: { speed: 15, direction: 180 },
    waterTemp: 22,
  },
  weather: { temperature: 25, uvIndex: 6 },
  sunrise: "06:30",
  sunset: "19:45",
};

test('Save Forecast', async (t) => {
  await t.test('Saves forecast successfully', () => {
    const storage = new MockStorage();
    const result = saveForecast(storage, mockPayload);
    assert.equal(result, undefined, 'Should not throw');
    const stored = storage.getItem('forecast_cache');
    assert.ok(stored, 'Should store data');
    assert.deepEqual(JSON.parse(stored), mockPayload, 'Should store correct payload');
  });

  await t.test('Throws when storage is null', async () => {
    await assert.rejects(
      async () => saveForecast(null, mockPayload),
      /storage not found/,
      'Should throw when storage is null'
    );
  });

  await t.test('Throws when storage lacks setItem', async () => {
    await assert.rejects(
      async () => saveForecast({}, mockPayload),
      /storage not found/,
      'Should throw when setItem is missing'
    );
  });
});

test('Load Forecast', async (t) => {
  await t.test('Loads forecast successfully', () => {
    const storage = new MockStorage();
    storage.setItem('forecast_cache', JSON.stringify(mockPayload));

    const loaded = loadForecast(storage);
    assert.deepEqual(loaded, mockPayload, 'Should load stored forecast');
  });

  await t.test('Returns null when no forecast stored', () => {
    const storage = new MockStorage();
    const loaded = loadForecast(storage);
    assert.equal(loaded, null, 'Should return null when no forecast');
  });

  await t.test('Throws when storage is null', async () => {
    await assert.rejects(
      async () => loadForecast(null),
      /storage not found/,
      'Should throw when storage is null'
    );
  });

  await t.test('Throws when storage lacks getItem', async () => {
    await assert.rejects(
      async () => loadForecast({}),
      /storage not found/,
      'Should throw when getItem is missing'
    );
  });

  await t.test('Throws when JSON is corrupted', async () => {
    const storage = new MockStorage();
    storage.setItem('forecast_cache', 'not valid json {');
    await assert.rejects(
      async () => loadForecast(storage),
      /Unexpected token/,
      'Should throw on JSON parse error'
    );
  });
});