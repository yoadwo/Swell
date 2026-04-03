/**
 * Mock data for testing Swell Index UI
 * This will be replaced with real data from Side Service in Phase 3
 */

export const MOCK_FORECAST_HIGH = {
  current: {
    waveHeight: 1.8,
    wavePeriod: 14,
    waveDirection: 315,
    windSpeed: 10,
    windDirection: 90,
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
    waveHeight: 1.2,
    wavePeriod: 10,
    waveDirection: 270,
    windSpeed: 15,
    windDirection: 100,
    waterTemp: 20,
  },
  sunrise: "06:15",
  sunset: "19:30",
  weather: {
    temperature: 26,
    uvIndex: 6,
  },
  updatedAt: Math.floor(Date.now() / 1000),
};

export const MOCK_FORECAST_LOW = {
  current: {
    waveHeight: 0.8,
    wavePeriod: 8,
    waveDirection: 180,
    windSpeed: 5,
    windDirection: 45,
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
export function getMockForecast(level = 'high') {
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
