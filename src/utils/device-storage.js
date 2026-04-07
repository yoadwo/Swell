/**
 * Device Storage - Watch-local storage for caching forecast data.
 * 
 * Uses `storage` imported from @zos/storage (NOT settingsStorage).
 * This is the watch's own persistent storage.
 * 
 * Data stored here:
 * - forecast_cache: The full forecast payload received from Side Service
 * 
 * Used by: Device App (page/index.js)
 * Read by: Device App pages (main, conditions, weather, forecast, workout extension)
 */

/**
 * @typedef {Object} ForecastPayload
 * @property {string} beach - Beach name
 * @property {number} score - Swell Index score (0-10)
 * @property {number} updatedAt - Unix timestamp of last update
 * @property {Object} current - Current conditions (swell, wind, waterTemp)
 * @property {string} sunrise - Sunrise time (HH:MM)
 * @property {string} sunset - Sunset time (HH:MM)
 * @property {Object} weather - Weather (temperature, uvIndex)
 */

import { log as Logger } from "@zos/utils";
import { storage } from "@zos/storage";

const logger = Logger.getLogger("utils.device-storage");
const FORECAST_KEY = "forecast_cache";

/**
 * Save forecast payload to device storage
 * @param {ForecastPayload} payload
 */
export function saveForecast(payload) {
  logger.log("Saving forecast:", payload?.beach);
  try {
    storage.setItem(FORECAST_KEY, JSON.stringify(payload));
    logger.log("Forecast saved");
  } catch (e) {
    logger.error("Failed to save forecast:", e);
  }
}

/**
 * Load forecast from device storage
 * @returns {ForecastPayload|null}
 */
export function loadForecast() {
  logger.log("Loading forecast from device storage");
  try {
    const raw = storage.getItem(FORECAST_KEY);
    if (raw) {
      logger.log("Found cached forecast");
      return JSON.parse(raw);
    }
    logger.log("No cached forecast");
  } catch (e) {
    logger.error("Failed to load forecast:", e);
  }
  return null;
}

/**
 * Clear cached forecast from device storage
 */
export function clearForecast() {
  try {
    storage.removeItem(FORECAST_KEY);
    logger.log("Cache cleared");
  } catch (e) {
    logger.error("Failed to clear forecast:", e);
  }
}
