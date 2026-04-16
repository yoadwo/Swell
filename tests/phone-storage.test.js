/**
 * Unit tests for phone storage logic
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/storage.test.js
 */

import { saveBeach, loadBeach } from '../src/utils/phone-storage.js';
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

test('Save Beach', async (t) => {
  await t.test('Saves beach successfully', () => {
    const storage = new MockStorage();
    const beach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
    const result = saveBeach(storage, beach);
    assert.equal(result, true, 'Should return true on success');
    assert.deepEqual(JSON.parse(storage.getItem('selectedBeach')), beach, 'Beach should be stored');
  });

  await t.test('Handles null storage gracefully', () => {
    const beach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
    const result = saveBeach(null, beach);
    assert.equal(result, false, 'Should return false when storage is null');
  });

  await t.test('Handles missing setItem gracefully', () => {
    const storage = { /* no setItem method */ };
    const beach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
    const result = saveBeach(storage, beach);
    assert.equal(result, false, 'Should return false when setItem is missing');
  });
});

test('Load Beach', async (t) => {
  await t.test('Loads beach successfully', () => {
    const storage = new MockStorage();
    const beach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
    storage.setItem('selectedBeach', JSON.stringify(beach));
    
    const loaded = loadBeach(storage);
    assert.deepEqual(loaded, beach, 'Should load stored beach');
  });

  await t.test('Returns null when no beach stored', () => {
    const storage = new MockStorage();
    const loaded = loadBeach(storage);
    assert.equal(loaded, null, 'Should return null when beach not found');
  });

  await t.test('Throws when storage is null', async () => {
    await assert.rejects(
      async () => loadBeach(null),
      /settingsStorage not available/,
      'Should throw when storage is null'
    );
  });

  await t.test('Throws when getItem is missing', async () => {
    const storage = { /* no getItem method */ };
    await assert.rejects(
      async () => loadBeach(storage),
      /settingsStorage not available/,
      'Should throw when getItem is missing'
    );
  });

  await t.test('Throws when JSON is corrupted', async () => {
    const storage = new MockStorage();
    storage.setItem('selectedBeach', 'not valid json {');
    await assert.rejects(
      async () => loadBeach(storage),
      /Unexpected token/,
      'Should throw on JSON parse error'
    );
  });
});