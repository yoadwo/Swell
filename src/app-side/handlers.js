/**
 * Forecast request handlers - pure logic separated from BLE/native code
 * Can be unit tested without running the app
 * 
 * Flow:
 * 1. Load beach (name, lat, lon) from storage
 * 2. Fetch forecast data from API (or mock) using coordinates
 * 3. Calculate score from forecast conditions
 * 4. Aggregate result: { beach, score, current, ... }
 * 5. Return final payload
 */

import { getMockForecast } from "../utils/mock-data.js";

/**
 * Fetch forecast data from weather API
 * Private method - currently uses mock data
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Raw forecast data {current, hourly, weather, ...}
 * 
 * TODO: Replace with real API call (Open-Meteo Marine, StormGlass, etc.)
 * Expected shape from API:
 * {
 *   current: { waveHeight, wavePeriod, waveDirection, windSpeed, windDirection, waterTemp },
 *   hourly?: [ { time, waveHeight, ... }, ... ],
 *   weather?: { temperature, uvIndex },
 *   sunrise?, sunset?
 * }
 */
async function fetchForecast(lat, lon) {
  // TODO: Call real weather API with lat/lon
  // For now, use mock data (ignoring coordinates)
  const forecastData = getMockForecast('high');
  return forecastData;
}

/**
 * Calculate Swell Index score from forecast conditions
 * Private method - converts raw weather data to 0-10 score
 * 
 * Algorithm: Israel-specific (all beaches face west, so wind direction is consistently relevant)
 * 
 * Factors:
 * 1. Wind (Primary Key) - Critical for offshore/onshore determination
 * 2. Swell Height - Workable range 0.7m - 1.3m
 * 3. Wave Period - Higher period = cleaner/organized waves
 * 4. Execution Window - 7am-7pm only
 * 
 * @param {Object} forecastData - Raw forecast {current: {waveHeight, wavePeriod, windSpeed, windDirection}}
 * @returns {number} - Score 0-10
 */
function calculateScore(forecastData) {
  if (!forecastData || !forecastData.current) {
    throw new Error('Invalid forecast data');
  }

  const { waveHeight, wavePeriod, windSpeed, windDirection } = forecastData.current;

  // Step 1: Calculate wind favorability score (0-3)
  // Uses sea direction to determine offshore/onshore
  // For Israel: all beaches face west, so hardcoded 270 ('west')
  const windFavorabilityScore = getWindScore(windDirection, 270);
  
  // Step 2: Calculate component scores (each 0-3, then normalize to 0-10)
  let heightScore = 0;
  let periodScore = 0;

  // Wind velocity score (knots converted from m/s: 1 m/s ≈ 1.94 knots)
  const windKnots = windSpeed * 1.94;
  let windVelocityScore = 0;
  if (windKnots <= 5) {
    windVelocityScore = 3; // Great
  } else if (windKnots <= 8) {
    windVelocityScore = 2; // OK
  } else {
    windVelocityScore = 1; // Low (9+ knots)
  }

  // Combine wind direction favorability with velocity
  // Direction (offshore/onshore) is critical, velocity is secondary
  const windScore = (windFavorabilityScore * 2 + windVelocityScore) / 3;

  // Swell height (meters)
  if (waveHeight >= 0.9 && waveHeight <= 1.3) {
    heightScore = 3; // Great (90cm-130cm)
  } else if (waveHeight >= 0.7 && waveHeight < 0.9) {
    heightScore = 2; // OK (70cm-90cm)
  } else if (waveHeight < 0.7 || waveHeight > 1.3) {
    heightScore = 1; // Low (too small or too large)
  }

  // Wave period (seconds)
  if (wavePeriod >= 10) {
    periodScore = 3; // Great (10s+)
  } else if (wavePeriod >= 8) {
    periodScore = 2; // Good (8-10s)
  } else if (wavePeriod >= 7) {
    periodScore = 1; // Low (7s)
  } else {
    periodScore = 0; // Very low (<7s)
  }

  // Aggregate: Average the three factors and scale to 0-10
  const avgScore = (windScore + heightScore + periodScore) / 3;
  const finalScore = Math.round(avgScore * (10 / 3) * 10) / 10; // Scale 0-3 avg to 0-10 range

  return Math.max(0, Math.min(10, finalScore));
}

/**
 * Calculate wind score based on direction relative to sea direction
 * Wind coming from the land to the sea = offshore (favorable)
 * Wind coming from the sea to the land = onshore (unfavorable)
 *
 * Algorithm:
 * 1. Calculate offshore direction (seaDirection + 180°)
 * 2. Calculate angular difference between wind and offshore direction
 * 3. Map difference to cardinal direction and apply score table
 * 
 * Examples:
 * - Sea direction 270° (West): Offshore = 90° ± 45° = East cone (45°-135°)
 * - Sea direction 0° (North): Offshore = 180° ± 45° = South cone (135°-225°)
 * - Sea direction 90° (East): Offshore = 270° ± 45° = West cone (225°-315°)
 *
 * Future consideration: Sea direction varies by location
 * When expanding beyond Israel, store seaDirection in beach metadata and pass dynamically.
 * For Israel: All beaches face west (270°), so hardcoded to 270 for now.
 * 
 * @param {number} windDirection - Direction in degrees (0-360, where 0/360 is N, 90 is E, 180 is S, 270 is W)
 * @param {number} seaDirection - Direction ocean faces in degrees (0-360). Default 270° (West) for Israel
 * @returns {number} - Wind score 0-3 based on offshore favorability
 */
function getWindScore(windDirection, seaDirection = 270) {
  if (windDirection === undefined || windDirection === null) {
    throw new Error('Wind direction is required');
  }

  if (typeof windDirection !== 'number' || typeof seaDirection !== 'number'
    || windDirection > 360 || seaDirection > 360
  ) {
    throw new Error('Invalid wind or sea direction');
  }

  // Calculate offshore direction (opposite of sea direction)
  const offshoreDirection = (seaDirection + 180) % 360;

  // Calculate angular difference between wind and offshore direction
  // We want winds within ±45° of offshore direction to be favorable
  let diff = Math.abs(windDirection - offshoreDirection);

  // Handle wrap-around (e.g., difference between 350° and 10° is 20°, not 340°)
  if (diff > 180) {
    diff = 360 - diff;
  }

  // Score based on how well wind aligns with offshore direction
  if (diff <= 45) {
    return 3; // Great (optimal offshore: within 45° of offshore direction)
  } else if (diff <= 90) {
    return 2; // Good (somewhat offshore or side wind)
  } else if (diff <= 135) {
    return 1; // Acceptable (side wind)
  } else {
    return 0; // Poor (onshore - wind coming from sea direction)
  }
}

/**
 * Handle GET_FORECAST request - main async entry point
 * 
 * @param {Object} storage - settingsStorage object (from Zepp environment)
 * @returns {Promise<Object|null>} - Aggregated payload {beach, score, current, hourly, ...}
 *                                   or null if no beach selected or error
 */
export async function handleGetForecastRequestAsync(storage) {
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
    forecastData = await fetchForecast(beach.lat, beach.lon);
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

/**
 * Export helper functions for testing
 * (Not used in production, only for unit tests)
 */
export { calculateScore as _calculateScore, getWindScore as _getWindScore };