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
                swell: {
                    height: 1.1,
                    period: 10,
                    direction: 315,
                },
                wind: {
                    height: 0.3,
                    direction: 90,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 10, 'All factors favorable');
    });

    await t.test('GREEN: With onshore wind', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 1.2,
                    period: 12,
                    direction: 270,
                },
                wind: {
                    height: 0.3,
                    direction: 270,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 7.8, 'Excellent swell conditions compensate for onshore wind');
    });

    await t.test('GREEN: With moderate wind chop', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 0.8,
                    period: 9,
                    direction: 315,
                },
                wind: {
                    height: 0.6,
                    direction: 75,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 7.4, 'Decent conditions overall');
    });

    // YELLOW (Score 4-7)
    await t.test('YELLOW: With short swell period', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 1.1,
                    period: 5,
                    direction: 315,
                },
                wind: {
                    height: 0.3,
                    direction: 90,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 6.7, 'Reduced swell quality');
    });

    await t.test('YELLOW: With poor wind direction', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 1.1,
                    period: 5,
                    direction: 315,
                },
                wind: {
                    height: 0.2,
                    direction: 15,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 5.9, 'Multiple reduced factors');
    });

    // RED (Score < 4) - Real low parameters
    await t.test('RED: All poor parameters', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 0.3,
                    period: 5,
                    direction: 180,
                },
                wind: {
                    height: 1.2,
                    direction: 270,
                },
            },
        };
        assert.equal(calculateScore(forecastData), 1.5, 'Unfavorable conditions');
    });

    await t.test('RED: Tiny swell with heavy wind chop', () => {
        const forecastData = {
            current: {
                swell: {
                    height: 0.2,
                    period: 4,
                    direction: 180,
                },
                wind: {
                    height: 1.0,
                    direction: 270,
                },
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

    await t.test('Error: Missing swell or wind throws', () => {
        assert.throws(
            () => calculateScore({ current: { swell: { height: 1, period: 10, direction: 315 } } }),
            /Invalid forecast data: missing swell or wind/,
            'Missing wind should throw'
        );
    });

    await t.test('Score is always between 0 and 10', () => {
        const testCases = [
            { swell: { height: 0.1, period: 1, direction: 180 }, wind: { height: 1.5, direction: 0 } },
            { swell: { height: 5.0, period: 30, direction: 90 }, wind: { height: 0, direction: 180 } },
            { swell: { height: 1.0, period: 10, direction: 315 }, wind: { height: 0.5, direction: 45 } },
        ];

        testCases.forEach(current => {
            const score = calculateScore({ current });
            assert(score >= 0 && score <= 10, 'Score should be 0-10 (got ' + score + ')');
        });
    });
});