/**
 * Unit tests for score logic
 * These can be run in Node.js without the watch simulator
 * 
 * Usage: node --test ../tests/score.test.js
 */

import { getTrafficLightState, calculateScore, getWindScore } from '../src/utils/score.js';
import { test } from "node:test";
import assert from "node:assert/strict";

test('Traffic Light State', async (t) => {
  await t.test('Green state for score 10', () => {
    const state = getTrafficLightState(10);
    assert.equal(state.color, 0x00FF00, 'Color should be green');
    assert.equal(state.text, 'Go Crazy', 'Text should be "Go Crazy"');
    assert.equal(state.icon, '🏄', 'Icon should be surfboard');
  });

  await t.test('Green state for score 7 (boundary)', () => {
    const state = getTrafficLightState(7);
    assert.equal(state.color, 0x00FF00, 'Color should be green');
  });

  await t.test('Yellow state for score 5 (mid-range)', () => {
    const state = getTrafficLightState(5);
    assert.equal(state.color, 0xFFFF00, 'Color should be yellow');
    assert.equal(state.text, 'Have Fun', 'Text should be "Have Fun"');
    assert.equal(state.icon, '🌊', 'Icon should be wave');
  });

  await t.test('Yellow state for score 4 (boundary)', () => {
    const state = getTrafficLightState(4);
    assert.equal(state.color, 0xFFFF00, 'Color should be yellow');
  });

  await t.test('Red state for score 0', () => {
    const state = getTrafficLightState(0);
    assert.equal(state.color, 0xFF0000, 'Color should be red');
    assert.equal(state.text, 'Better Get Coffee', 'Text should be "Better Get Coffee"');
    assert.equal(state.icon, '☕', 'Icon should be coffee');
  });

  await t.test('Red state for score 3 (boundary)', () => {
    const state = getTrafficLightState(3);
    assert.equal(state.color, 0xFF0000, 'Color should be red');
  });

  await t.test('Clamps negative scores to 0', () => {
    const state = getTrafficLightState(-5);
    assert.equal(state.color, 0xFF0000, 'Negative score should clamp to red');
  });

  await t.test('Clamps scores above 10', () => {
    const state = getTrafficLightState(15);
    assert.equal(state.color, 0x00FF00, 'Score > 10 should clamp to green');
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
    assert.equal(calculateScore(forecastData), 7.8, 'Reduced swell quality');
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
          direction: 270,
        },
      },
    };
    assert.equal(calculateScore(forecastData), 5.6, 'Multiple reduced factors');
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
    assert.equal(calculateScore(forecastData), 2.6, 'Unfavorable conditions');
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

