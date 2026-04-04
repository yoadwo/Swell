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
 * Wraps real fetch API for weather data
 * 
 * @param {string} apiUrl - Base URL for weather API
 * @returns {HttpClient} - Object with fetch method
 */
export function createHttpClient(apiUrl = "https://api.open-meteo.com") {
  return {
    /**
     * Fetch real weather data from API
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} - Forecast data from API
     */
    async fetch(lat, lon) {
      // TODO: Replace with real API call (Open-Meteo Marine, StormGlass, etc.)
      // Expected shape from API:
      // {
      //   current: { waveHeight, wavePeriod, waveDirection, windSpeed, windDirection, waterTemp },
      //   hourly?: [ { time, waveHeight, ... }, ... ],
      //   weather?: { temperature, uvIndex },
      //   sunrise?, sunset?
      // }
      console.log(`Fetching forecast from ${apiUrl} for ${lat}, ${lon}`);
      
      // Placeholder: for now return mock data
      return getMockForecast('high');
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
