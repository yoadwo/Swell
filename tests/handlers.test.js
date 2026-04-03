/**
 * Example unit tests for forecast handlers
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/handlers.test.js
 */

import { handleGetForecastRequestAsync, createMockHttpClient, _calculateScore, _getWindScore } from '../src/app-side/handlers.js';
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

        // Score 3: Great offshore (diff <= 45°)
        assert.equal(_getWindScore(90, 270), 3, '90° (E) diff=0° = 3');
        assert.equal(_getWindScore(60, 270), 3, '60° (ENE) diff=30° = 3');
        assert.equal(_getWindScore(120, 270), 3, '120° (ESE) diff=30° = 3');
        assert.equal(_getWindScore(45, 270), 3, '45° (NE) diff=45° = 3');
        assert.equal(_getWindScore(135, 270), 3, '135° (SE) diff=45° = 3');

        // Score 2: Good offshore (45 < diff <= 90°)
        assert.equal(_getWindScore(30, 270), 2, '30° (NNE) diff=60° = 2');
        assert.equal(_getWindScore(150, 270), 2, '150° (SSE) diff=60° = 2');
        assert.equal(_getWindScore(0, 270), 2, '0° (N) diff=90° = 2');
        assert.equal(_getWindScore(180, 270), 2, '180° (S) diff=90° = 2');

        // Score 1: Side winds (90 < diff <= 135°)
        assert.equal(_getWindScore(200, 270), 1, '200° (SSW) diff=110° = 1');
        assert.equal(_getWindScore(340, 270), 1, '340° (NNW) diff=110° = 1');
        assert.equal(_getWindScore(225, 270), 1, '225° (SW) diff=135° = 1');
        assert.equal(_getWindScore(315, 270), 1, '315° (NW) diff=135° (wrap) = 1');

        // Score 0: Poor onshore (diff > 135°)
        assert.equal(_getWindScore(270, 270), 0, '270° (W) diff=180° = 0');
        assert.equal(_getWindScore(260, 270), 0, '260° (WSW) diff=170° = 0');
        assert.equal(_getWindScore(280, 270), 0, '280° (WNW) diff=170° = 0');
    });
    
    await t.test('Wind score - East-facing beach (sea at 90°)', () => {
        // Sea direction = 90° (East)
        // Offshore = 270° (West)
        
        // Score 3: diff <= 45° (225°-315°)
        assert.equal(_getWindScore(270, 90), 3, '270° (W) diff=0° = 3');
        assert.equal(_getWindScore(250, 90), 3, '250° (WSW) diff=20° = 3');
        assert.equal(_getWindScore(290, 90), 3, '290° (WNW) diff=20° = 3');
        assert.equal(_getWindScore(225, 90), 3, '225° (SW) diff=45° = 3');
        assert.equal(_getWindScore(315, 90), 3, '315° (NW) diff=45° = 3');
        
        // Score 2: 45° < diff <= 90° (180°-225°, 315°-360°)
        assert.equal(_getWindScore(180, 90), 2, '180° (S) diff=90° = 2');
        assert.equal(_getWindScore(0, 90), 2, '0° (N) diff=90° = 2');
        
        // Score 0: Onshore (from East)
        assert.equal(_getWindScore(90, 90), 0, '90° (E) diff=180° = 0');
    });

    await t.test('Wind score - wrap-around at 0/360°', () => {
        // Test wrap-around: 350° is 80° from 270° (offshore)
        assert.equal(_getWindScore(350, 270), 1, '350° is 80° from 90° = 2');
        assert.equal(_getWindScore(10, 270), 2, '10° is 80° from 90° = 2');
    });

    // GREEN (Score >= 7)
    await t.test('GREEN: Optimal conditions (9.6)', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 10,
                windSpeed: 3,
                windDirection: 90, // Optimal offshore
            },
        };
        assert.equal(_calculateScore(forecastData), 9.6, 'Optimal = GREEN');
    });

    await t.test('GREEN: With onshore wind (7.4)', () => {
        const forecastData = {
            current: {
                waveHeight: 1.2,
                wavePeriod: 12,
                windSpeed: 3,
                windDirection: 270, // Onshore
            },
        };
        assert.equal(_calculateScore(forecastData), 7.4, 'Even onshore still GREEN with great conditions');
    });

    await t.test('GREEN: With medium wind speed (7.0)', () => {
        const forecastData = {
            current: {
                waveHeight: 0.8,
                wavePeriod: 9,
                windSpeed: 6, // Changed from 3
                windDirection: 75,
            },
        };
        assert.equal(_calculateScore(forecastData), 7, 'Medium wind = GREEN');
    });

    // YELLOW (Score 4-7)
    await t.test('YELLOW: With short wave period (5)', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 5,
                windSpeed: 3,
                windDirection: 90,
            },
        };
        assert.equal(_calculateScore(forecastData), 6.3, 'Short period = YELLOW (barely)');
    });

    await t.test('YELLOW: With bad wind', () => {
        const forecastData = {
            current: {
                waveHeight: 1.1,
                wavePeriod: 5,
                windSpeed: 1,
                windDirection: 15,
            },
        };
        assert.equal(_calculateScore(forecastData), 5.9, 'Short period = YELLOW (barely)');
    });

    // RED (Score < 4) - Real low parameters
    await t.test('RED: All bad parameters (1.5)', () => {
        const forecastData = {
            current: {
                waveHeight: 0.3, // Very small
                wavePeriod: 5,   // Too short
                windSpeed: 15,   // Very strong
                windDirection: 270, // Onshore
            },
        };
        assert.equal(_calculateScore(forecastData), 1.5, 'All bad params = RED');
    });

    await t.test('RED: Tiny waves with onshore wind (1.5)', () => {
        const forecastData = {
            current: {
                waveHeight: 0.2, // Extremely small
                wavePeriod: 4,   // Very short
                windSpeed: 12,   // Strong onshore
                windDirection: 270,
            },
        };
        assert.equal(_calculateScore(forecastData), 1.5, 'Tiny waves + onshore = RED');
    });

    // Error handling tests
    await t.test('Error: Null forecast throws', () => {
        assert.throws(
            () => _calculateScore(null),
            /Invalid forecast data/,
            'Null forecast should throw'
        );
    });

    await t.test('Error: Empty forecast throws', () => {
        assert.throws(
            () => _calculateScore({}),
            /Invalid forecast data/,
            'Empty forecast should throw'
        );
    });

    await t.test('Error: Missing wind direction throws', () => {
        assert.throws(
            () => _calculateScore({ current: { waveHeight: 1, wavePeriod: 10, windSpeed: 5 } }),
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
            const score = _calculateScore({ current });
            assert(score >= 0 && score <= 10, 'Score should be 0-10 (got ' + score + ')');
        });
    });
});