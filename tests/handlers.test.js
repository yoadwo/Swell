/**
 * Example unit tests for forecast handlers
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/handlers.test.js
 */

import { handleGetForecastRequestAsync } from '../src/app-side/handlers.js';
import { createMockHttpClient } from '../src/utils/http.js';
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

test('Forecast Generation', async (t) => {
    // Create mock HTTP client for all tests in this suite
    const mockHttpClient = createMockHttpClient('high');

    await t.test('Returns null when no beach selected', async () => {
        const storage = new MockStorage();
        const payload = await handleGetForecastRequestAsync(storage, mockHttpClient);
        assert(payload === null, 'Should return null when no beach selected');
    });

    await t.test('Throws when storage is not available', async () => {
        await assert.rejects(
            async () => await handleGetForecastRequestAsync(null, mockHttpClient),
            /settingsStorage not available/,
            'Should throw when storage is null'
        );
    });

    await t.test('Throws when beach data is corrupted', async () => {
        const storage = new MockStorage({
            'selectedBeach': 'invalid json {',
        });

        await assert.rejects(
            async () => await handleGetForecastRequestAsync(storage, mockHttpClient),
            /Unexpected token/,
            'Should throw on parse error'
        );
    });

    await t.test('Returns payload with selected beach from storage', async () => {
        const selectedBeach = { name: 'Bat Yam', lat: 32.015, lon: 34.74 };
        const storage = new MockStorage({
            'selectedBeach': JSON.stringify(selectedBeach),
        });

        const payload = await handleGetForecastRequestAsync(storage, mockHttpClient);
        assert(payload !== null, 'Should return payload when beach is selected');
        assert.equal(payload.beach, 'Bat Yam', 'Should use beach name from storage');
    });
});

test('Forecast Payload Structure', async (t) => {
    const mockHttpClient = createMockHttpClient('high');
    
    await t.test('Payload includes all required fields', async () => {
        const selectedBeach = { name: 'Frishman', lat: 32.0949, lon: 34.7726 };
        const storage = new MockStorage({
            'selectedBeach': JSON.stringify(selectedBeach),
        });

        const payload = await handleGetForecastRequestAsync(storage, mockHttpClient);
        assert(payload !== null, 'Should have payload');

        // Beach and score
        assert.equal(payload.beach, 'Frishman', 'Should include beach name');
        assert.equal(typeof payload.score, 'number', 'Should include score as number');
        assert(payload.score >= 0 && payload.score <= 10, 'Score should be 0-10');

        // Timestamp
        assert(payload.updatedAt !== undefined, 'Should include updatedAt');
        assert.equal(typeof payload.updatedAt, 'number', 'updatedAt should be a number (timestamp)');

        // Current conditions
        const current = payload.current;
        assert(current !== undefined, 'Should include current conditions');
        assert(current.swell !== undefined, 'Should have swell');
        assert(current.swell.height !== undefined, 'Should have swell height');
        assert(current.swell.period !== undefined, 'Should have swell period');
        assert(current.swell.direction !== undefined, 'Should have swell direction');
        assert(current.wind !== undefined, 'Should have wind');
        assert(current.wind.height !== undefined, 'Should have wind wave height');
        assert(current.wind.direction !== undefined, 'Should have wind direction');
        assert(current.waterTemp !== undefined, 'Should have waterTemp');
    });
});