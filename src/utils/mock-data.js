/**
 * Mock data for testing Swell Index UI
 * This will be replaced with real data from Side Service in Phase 3
 */

export const MOCK_FORECAST_HIGH = {
  current: {
    swell: {
      height: 1.2,
      period: 14,
      direction: 315,
    },
    wind: {
      height: 0.3,
      direction: 90,
      speed: 12
    },
    waterTemp: 22,
  },
  sunrise: "06:15",
  sunset: "19:30",
  weather: {
    temperature: 28,
    uvIndex: 7,
  },
  updatedAt: Math.floor(Date.now() / 1000),
};

export const MOCK_FORECAST_MEDIUM = {
  current: {
    swell: {
      height: 0.8,
      period: 6,
      direction: 270,
    },
    wind: {
      height: 0.6,
      direction: 100,
      speed: 18
    },
    waterTemp: 20,
  },
  sunrise: "06:15",
  sunset: "19:30",
  weather: {
    temperature: 26,
    uvIndex: 6,
  },
  updatedAt: 1772882880,
};

export const MOCK_FORECAST_LOW = {
  current: {
    swell: {
      height: 0.2,
      period: 2,
      direction: 180,
    },
    wind: {
      height: 0.8,
      direction: 180,
      speed: 5
    },
    waterTemp: 18,
  },
  sunrise: "06:15",
  sunset: "19:30",
  weather: {
    temperature: 24,
    uvIndex: 5,
  },
  updatedAt: Math.floor(Date.now() / 1000),
};

/**
 * Get mock forecast based on score level for testing
 * @param {string} level - 'high', 'medium', or 'low'
 * @returns {Object} - Mock forecast payload
 */
export function getMockForecast(level) {
  switch (level) {
    case 'high':
      return { ...MOCK_FORECAST_HIGH };
    case 'medium':
      return { ...MOCK_FORECAST_MEDIUM };
    case 'low':
      return { ...MOCK_FORECAST_LOW };
    default:
      return { ...MOCK_FORECAST_HIGH };
  }
}
