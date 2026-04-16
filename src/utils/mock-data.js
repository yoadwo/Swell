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

export const MOCK_FORECAST_DAILY = [
  {
    day: "Mon",
    waveHeightMin: 1.2,
    waveHeightMax: 1.8,
    period: 12,
    windSpeed: 10,
    windDirection: 90,
    score: 8,
  },
  {
    day: "Tue",
    waveHeightMin: 1.0,
    waveHeightMax: 1.5,
    period: 10,
    windSpeed: 15,
    windDirection: 100,
    score: 6,
  },
  {
    day: "Wed",
    waveHeightMin: 0.8,
    waveHeightMax: 1.2,
    period: 8,
    windSpeed: 20,
    windDirection: 270,
    score: 4,
  },
  {
    day: "Thu",
    waveHeightMin: 1.5,
    waveHeightMax: 2.2,
    period: 14,
    windSpeed: 8,
    windDirection: 45,
    score: 9,
  },
];

export function getMockForecast(level) {
  let current;
  switch (level) {
    case 'high':
      current = { ...MOCK_FORECAST_HIGH };
      break;
    case 'medium':
      current = { ...MOCK_FORECAST_MEDIUM };
      break;
    case 'low':
      current = { ...MOCK_FORECAST_LOW };
      break;
    default:
      current = { ...MOCK_FORECAST_HIGH };
  }
  return {
    ...current,
    forecast: MOCK_FORECAST_DAILY,
  };
}
