/**
 * Forecast request handlers - pure logic separated from BLE/native code
 * Can be unit tested without running the app
 * 
 * Flow:
 * 1. Load beach (name, lat, lon) from storage
 * 2. Fetch forecast data using coordinates
 * 3. Calculate score from forecast conditions
 * 4. Aggregate result: { beach, score, current, ... }
 * 5. Return final payload
 */

import { calculateScore } from "../utils/score.js";

/**
 * Fetch forecast data using injected HTTP client
 * Private method
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {HttpClient} httpClient - HTTP client instance
 * @returns {Promise<Object>} - Raw forecast data {current, hourly, weather, ...}
 */
async function fetchForecast(lat, lon, httpClient) {
  return httpClient.fetch(lat, lon);
}

/**
 * Handle GET_FORECAST request - main async entry point
 * 
 * @param {Object} storage - settingsStorage object (from Zepp environment)
 * @param {HttpClient} httpClient - HTTP client instance
 * @returns {Promise<Object|null>} - Aggregated payload {beach, score, current, hourly, ...}
 *                                   or null if no beach selected or error
 */
export async function handleGetForecastRequestAsync(storage, httpClient) {
  // Default to real HTTP client if not injected
  if (!httpClient) {
    throw new Error('HTTP client is required');
  }

  // Step 1: Load beach with coordinates from storage
  let beach = null;
  try {
    if (!storage || !storage.getItem) {
      console.warn('Storage not available');
      return null;
    }
    
    const raw = storage.getItem('selectedBeach');
    if (!raw) {
      console.log('No beach selected in storage');
      return null;
    }
    
    beach = JSON.parse(raw);
    console.log('Loaded beach from storage:', beach.name);
  } catch (e) {
    console.warn('Failed to read beach from storage:', e);
    return null;
  }
  
  // Step 2: Fetch forecast data using coordinates
  let forecastData = null;
  try {
    forecastData = await fetchForecast(beach.lat, beach.lon, httpClient);
    console.log('Forecast fetched for coordinates:', beach.lat, beach.lon);
  } catch (e) {
    console.warn('Failed to fetch forecast:', e);
    return null;
  }
  
  // Step 3: Calculate score from forecast data
  let score = null;
  try {
    score = calculateScore(forecastData);
    console.log('Score calculated:', score);
  } catch (e) {
    console.warn('Failed to calculate score:', e);
    return null;
  }
  
  // Step 4: Aggregate and return final payload
  const payload = {
    beach: beach.name,
    score,
    updatedAt: Math.floor(Date.now() / 1000),
    ...forecastData, // Include current, hourly, weather, sunrise, sunset
  };
  
  console.log('Forecast payload aggregated for:', payload.beach);
  return payload;
}