/**
 * Forecast request handlers - pure logic separated from BLE/native code
 * Can be unit tested without running the app
 */

/**
 * Build forecast payload with hourly wave/score data
 * @param {Object} beach - Beach object {name, lat, lon}
 * @returns {Object} - Normalized forecast payload
 */
function buildForecastPayload(beach) {
  const now = Math.floor(Date.now() / 1000);
  const hourly = [];
  
  // Generate 24 hours of simulated wave data
  for (let i = 0; i < 24; i++) {
    hourly.push({
      time: now + i * 3600,
      waveHeight: Math.round((0.5 + Math.sin(i / 3) * 0.8) * 10) / 10,
      score: Math.max(0, Math.min(10, Math.round((5 + Math.sin(i / 4) * 3) * 10) / 10)),
    });
  }
  
  return {
    beach: beach.name,
    updatedAt: now,
    current: {
      waveHeight: hourly[0].waveHeight,
      wavePeriod: 10,
      waveDirection: 315,
      windSpeed: 8,
      windDirection: 45,
      waterTemp: 18,
    },
    hourly,
  };
}

/**
 * Handle GET_FORECAST request
 * @param {Object} storage - settingsStorage object (from Zepp environment)
 * @returns {Object|null} - Forecast payload, or null if no beach selected
 */
export function handleGetForecastRequest(storage) {
  // Try to read selected beach from storage
  let beach = null;
  
  try {
    if (storage && storage.getItem) {
      const raw = storage.getItem('selectedBeach');
      if (raw) {
        beach = JSON.parse(raw);
        console.log('Successfully read beach from storage:', beach.name);
      } else {
        console.log('No beach selected in storage');
        return null; // User must select a beach first
      }
    } else {
      console.warn('Storage not available');
      return null;
    }
  } catch (e) {
    console.warn('Failed to read beach from storage:', e);
    return null;
  }

  // Build and return forecast payload
  const payload = buildForecastPayload(beach);
  console.log('Forecast payload built for:', payload.beach);
  return payload;
}
