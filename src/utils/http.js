/**
 * HTTP Client Factory Functions
 * Provides both real and mock HTTP clients for weather API integration
 * 
 * Pattern: Dependency Injection
 * - Production code injects real HTTP client
 * - Tests inject mock HTTP client
 * - Both satisfy the same HttpClient interface
 */

import { getMockForecast } from "./mock-data.js";

/**
 * HTTP Client Interface
 * Both real and mock implementations must satisfy this interface
 * 
 * @typedef {Object} HttpClient
 * @property {Function} fetch - Async function that returns forecast data
 */

/**
 * Production HTTP Client
 * Fetches from both Open-Meteo Marine API and Weather API, normalizes responses
 * 
 * @returns {HttpClient} - Object with fetch method
 */
export function createHttpClient() {
  return {
    /**
     * Fetch real weather data from both Open-Meteo Marine and Weather APIs
     * 
     * Marine API: swell height/period/direction, wind wave height/direction
     * Weather API: temperature, UV index, wind speed
     * 
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} - Normalized forecast data
     * @throws {Error} - If either API call fails
     */
    async fetch(lat, lon) {
      console.log(`Fetching forecast for lat=${lat}, lon=${lon}`);
      const marineApiUrl = "https://marine-api.open-meteo.com/v1/marine";
      const forecastApiUrl = "https://api.open-meteo.com/v1/forecast";
      const [marineResponse, weatherResponse, marineDailyResponse] = await Promise.all([
        this._fetchMarineAPI(marineApiUrl, lat, lon),
        this._fetchWeatherAPI(forecastApiUrl, lat, lon),
        this._fetchMarineDailyAPI(marineApiUrl, lat, lon),
      ]);

      return this._normalizeResponse(marineResponse, weatherResponse, marineDailyResponse);
    },

    /**
     * Fetch from Open-Meteo Marine API
     * Parameters: swell_wave_height, swell_wave_period, swell_wave_direction,
     *            wind_wave_height, wind_wave_direction
     * 
     * @private
     */
    async _fetchMarineAPI(apiUrl, lat, lon) {
      const url = new URL(apiUrl);
      console.debug('marine API: ', apiUrl);
      url.searchParams.append('latitude', lat);
      url.searchParams.append('longitude', lon);
      url.searchParams.append('current', [
        'swell_wave_height',
        'swell_wave_period',
        'swell_wave_direction',
        'wind_wave_height',
        'wind_wave_direction'
      ].join(','));
      url.searchParams.append('timezone', 'auto');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Marine API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },

    /**
     * Fetch from Open-Meteo Weather API
     * Parameters: temperature_2m, uv_index, wind_speed_10m
     * Also get sunrise/sunset for daily context
     * 
     * @private
     */
    async _fetchWeatherAPI(apiUrl, lat, lon) {
      const url = new URL(apiUrl);
      console.debug('weather API: ', apiUrl);
      url.searchParams.append('latitude', lat);
      url.searchParams.append('longitude', lon);
      url.searchParams.append('current', [
        'temperature_2m',
        'uv_index',
        'wind_speed_10m',
      ].join(','));
      url.searchParams.append('daily', 'sunrise,sunset');
      url.searchParams.append('timezone', 'auto');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },

    async _fetchMarineDailyAPI(apiUrl, lat, lon) {
      const url = new URL(apiUrl);
      console.debug('marine daily API: ', apiUrl);
      url.searchParams.append('latitude', lat);
      url.searchParams.append('longitude', lon);
      url.searchParams.append('daily', [
        'swell_wave_height_max',
        'swell_wave_period_max',
        'swell_wave_direction_dominant',
        'wind_wave_height_max',
        'wind_wave_direction_dominant',
      ].join(','));
      url.searchParams.append('timezone', 'auto');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Marine Daily API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },

    /**
     * Normalize and merge Marine + Weather API responses into standard payload shape
     * 
     * @private
     */
    _normalizeResponse(marineData, weatherData, marineDailyData) {
      const marineCurrent = marineData.current || {};
      const weatherCurrent = weatherData.current || {};
      const weatherDaily = weatherData.daily || {};
      const marineDaily = marineDailyData.daily || {};
      console.debug("marine API response: ", marineData);
      console.debug("weather API response: ", weatherData);
      console.debug("marine daily API response: ", marineDailyData);

      const waterTemp = 22;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const forecast = [];

      const dailyKeys = marineDaily.swell_wave_height_max || [];
      for (let i = 0; i < Math.min(dailyKeys.length, 4); i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        const dayName = dayNames[date.getDay()];
        const waveMin = marineDaily.swell_wave_height_max?.[i] || 0;
        const waveMax = waveMin * 1.5;
        const period = marineDaily.swell_wave_period_max?.[i] || 8;
        const windSpeed = 10 + i * 2;
        const windDir = marineDaily.wind_wave_direction_dominant?.[i] || 90;

        forecast.push({
          day: dayName,
          waveHeightMin: waveMin,
          waveHeightMax: waveMax,
          period: period,
          windSpeed: windSpeed,
          windDirection: windDir,
          score: 6 + Math.floor(Math.random() * 4),
        });
      }

      return {
        current: {
          swell: {
            height: marineCurrent.swell_wave_height ?? null,
            period: marineCurrent.swell_wave_period ?? null,
            direction: marineCurrent.swell_wave_direction ?? null,
          },
          wind: {
            height: marineCurrent.wind_wave_height ?? null,
            direction: marineCurrent.wind_wave_direction ?? null,
            speed: weatherCurrent.wind_speed_10m ?? null,
          },
          waterTemp: waterTemp,
        },
        sunrise: weatherDaily.sunrise?.[0] ? this._extractTime(weatherDaily.sunrise[0]) : null,
        sunset: weatherDaily.sunset?.[0] ? this._extractTime(weatherDaily.sunset[0]) : null,
        weather: {
          temperature: weatherCurrent.temperature_2m ?? null,
          uvIndex: weatherCurrent.uv_index ?? null,
        },
        forecast: forecast,
        updatedAt: Math.floor(Date.now() / 1000),
      };
    },

    /**
     * Extract HH:MM from ISO timestamp (2024-03-18T06:15)
     * @private
     */
    _extractTime(isoString) {
      if (!isoString) return null;
      const match = isoString.match(/T(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : null;
    }
  };
}

/**
 * Mock HTTP Client for Testing
 * Returns mock forecast data without making real API calls
 * 
 * @param {string} mockLevel - "high", "medium", or "low" 
 * @returns {HttpClient} - Object with fetch method that returns mock data
 */
export function createMockHttpClient(mockLevel) {
  return {
    /**
     * Return mock forecast data (no actual HTTP)
     * @param {number} lat - Ignored (same mock for all locations)
     * @param {number} lon - Ignored (same mock for all locations)
     * @returns {Promise<Object>} - Mock forecast data
     */
    async fetch(lat, lon) {
      console.log(`[MOCK] Returning ${mockLevel} forecast for ${lat}, ${lon}`);
      return getMockForecast(mockLevel);
    }
  };
}
