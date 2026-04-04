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
      try {
        // Fetch from both APIs in parallel
        const [marineResponse, weatherResponse] = await Promise.all([
          this._fetchMarineAPI(marineApiUrl, lat, lon),
          this._fetchWeatherAPI(forecastApiUrl, lat, lon),
        ]);

        // Normalize and merge responses
        return this._normalizeResponse(marineResponse, weatherResponse);
      } catch (error) {
        console.error(`Failed to fetch forecast: ${error.message}`);
        throw error;
      }
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

    /**
     * Normalize and merge Marine + Weather API responses into standard payload shape
     * 
     * @private
     */
    _normalizeResponse(marineData, weatherData) {
      // Extract current conditions from Marine API
      const marineCurrent = marineData.current || {};
      const weatherCurrent = weatherData.current || {};
      const weatherDaily = weatherData.daily || {};

      // Water temperature: Marine API doesn't provide it; use a placeholder or hardcoded value
      // TODO: Consider adding water temperature from a separate API if available
      const waterTemp = 22; // Placeholder

      // Build normalized payload
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
export function createMockHttpClient(mockLevel = "high") {
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
