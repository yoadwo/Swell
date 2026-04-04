/**
 * Example unit tests for forecast handlers
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/handlers.test.js
 */

import { handleGetForecastRequestAsync } from '../src/app-side/handlers.js';
import { createMockHttpClient } from '../src/utils/http.js';
import { calculateScore, getWindScore } from '../src/utils/score.js';
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

    await t.test('Returns null when storage is not available', async () => {
        const payload = await handleGetForecastRequestAsync(null, mockHttpClient);
        assert(payload === null, 'Should return null when storage is null');
    });

    await t.test('Returns null when beach data is corrupted', async () => {
        const storage = new MockStorage({
            'selectedBeach': 'invalid json {',
        });

        const payload = await handleGetForecastRequestAsync(storage, mockHttpClient);
        assert(payload === null, 'Should return null on parse error');
    });

    await t.test('Returns payload with selected beach from storage', async () => {
        const selectedBeach = { name: 'Bat Yam', lat: 32.015, lon: 34.74 };
        const storage = new MockStorage({
            'selectedBeach': JSON.stringify(selectedBeach),
        });

        const payload = await handleGetForecastRequestAsync(storage, mockHttpClient);
        assert(payload !== null, 'Should return payload when beach is selected');
        assert.deepEqual(payload.beach, 'Bat Yam', 'Should use beach name from storage');
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
        assert(typeof payload.updatedAt === 'number', 'updatedAt should be a number (timestamp)');

        // Current conditions
        const current = payload.current;
        assert(current !== undefined, 'Should include current conditions');
        assert(current.waveHeight !== undefined, 'Should have waveHeight');
        assert(current.wavePeriod !== undefined, 'Should have wavePeriod');
        assert(current.waveDirection !== undefined, 'Should have waveDirection');
        assert(current.windSpeed !== undefined, 'Should have windSpeed');
        assert(current.windDirection !== undefined, 'Should have windDirection');
        assert(current.waterTemp !== undefined, 'Should have waterTemp');
    });
});


test('Score Calculation Algorithm', async (t) => {
    
    // Score 3: diff <= 45°
    // Score 2: diff > 45° and <= 90°
    // Score 1: diff > 90° and <= 135°
    // Score 0: diff > 135°
    
    await t.test('Wind score - Israel (sea at 270°/West, Offshore at 90°/East)', () => {

        // High scores for offshore winds
        assert.equal(getWindScore(90, 270), 3, 'Optimal offshore');
        assert.equal(getWindScore(60, 270), 3, 'Offshore from NE');
        assert.equal(getWindScore(120, 270), 3, 'Offshore from SE');

        // Mid scores for side winds
        assert.equal(getWindScore(30, 270), 2, 'Side wind from N');
        assert.equal(getWindScore(150, 270), 2, 'Side wind from S');
        assert.equal(getWindScore(0, 270), 2, 'Side wind from N');

        // Low scores for onshore winds
        assert.equal(getWindScore(200, 270), 1, 'Onshore from SW');
        assert.equal(getWindScore(340, 270), 1, 'Onshore from NW');

        // Zero for direct onshore
        assert.equal(getWindScore(270, 270), 0, 'Direct onshore (W)');
    });
    
    await t.test('Wind score - East-facing beach (sea at 90°)', () => {
        // Sea direction = 90° (East), Offshore = 270° (West)
        
        // High scores for offshore winds
        assert.equal(getWindScore(270, 90), 3, 'Optimal offshore (W)');
        assert.equal(getWindScore(250, 90), 3, 'Offshore from WSW');
        assert.equal(getWindScore(290, 90), 3, 'Offshore from WNW');
        
        // Mid scores for side winds
        assert.equal(getWindScore(180, 90), 2, 'Side wind from S');
        assert.equal(getWindScore(0, 90), 2, 'Side wind from N');
        
        // Zero for direct onshore
        assert.equal(getWindScore(90, 90), 0, 'Direct onshore (E)');
    });

    await t.test('Wind score - wrap-around at 0/360°', () => {
        // Tests angular wrap-around calculation
        assert.equal(getWindScore(350, 270), 1, 'NNW wind');
        assert.equal(getWindScore(10, 270), 2, 'NNE wind');
    });

    // GREEN (Score >= 7)
    await t.test('GREEN: Optimal conditions', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 10,
                windSpeed: 3,
                windDirection: 90, // Optimal offshore
            },
        };
        assert.equal(calculateScore(forecastData), 9.6, 'All factors favorable');
    });

    await t.test('GREEN: With onshore wind', () => {
        const forecastData = {
            current: {
                waveHeight: 1.2,
                wavePeriod: 12,
                windSpeed: 3,
                windDirection: 270, // Onshore
            },
        };
        assert.equal(calculateScore(forecastData), 7.4, 'Excellent wave conditions compensate for onshore wind');
    });

    await t.test('GREEN: With moderate wind speed', () => {
        const forecastData = {
            current: {
                waveHeight: 0.8,
                wavePeriod: 9,
                windSpeed: 6,
                windDirection: 75,
            },
        };
        assert.equal(calculateScore(forecastData), 7, 'Decent conditions overall');
    });

    // YELLOW (Score 4-7)
    await t.test('YELLOW: With short wave period', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 5,
                windSpeed: 3,
                windDirection: 90,
            },
        };
        assert.equal(calculateScore(forecastData), 6.3, 'Reduced wave quality');
    });

    await t.test('YELLOW: With poor wind', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 5,
                windSpeed: 1,
                windDirection: 15,
            },
        };
        assert.equal(calculateScore(forecastData), 5.9, 'Multiple reduced factors');
    });

    // RED (Score < 4) - Real low parameters
    await t.test('RED: All poor parameters', () => {
        const forecastData = {
            current: {
                waveHeight: 0.3,
                wavePeriod: 5,
                windSpeed: 15,
                windDirection: 270, // Onshore
            },
        };
        assert.equal(calculateScore(forecastData), 1.5, 'Unfavorable conditions');
    });

    await t.test('RED: Tiny waves with onshore wind', () => {
        const forecastData = {
            current: {
                waveHeight: 0.2,
                wavePeriod: 4,
                windSpeed: 12,
                windDirection: 270,
            },
        };
        assert.equal(calculateScore(forecastData), 1.5, 'Poor conditions across the board');
    });

    // Error handling tests
    await t.test('Error: Null forecast throws', () => {
        assert.throws(
            () => calculateScore(null),
            /Invalid forecast data/,
            'Null forecast should throw'
        );
    });

    await t.test('Error: Empty forecast throws', () => {
        assert.throws(
            () => calculateScore({}),
            /Invalid forecast data/,
            'Empty forecast should throw'
        );
    });

    await t.test('Error: Missing wind direction throws', () => {
        assert.throws(
            () => calculateScore({ current: { waveHeight: 1, wavePeriod: 10, windSpeed: 5 } }),
            /Wind direction is required/,
            'Missing wind direction should throw'
        );
    });

    await t.test('Score is always between 0 and 10', () => {
        const testCases = [
            { waveHeight: 0.1, wavePeriod: 1, windSpeed: 50, windDirection: 0 },
            { waveHeight: 5.0, wavePeriod: 30, windSpeed: 0, windDirection: 180 },
            { waveHeight: 1.0, wavePeriod: 10, windSpeed: 5, windDirection: 45 },
        ];

        testCases.forEach(current => {
            const score = calculateScore({ current });
            assert(score >= 0 && score <= 10, 'Score should be 0-10 (got ' + score + ')');
        });
    });
});