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
import { localStorage } from "@zos/storage";

const logger = Logger.getLogger("utils.device-storage");
const FORECAST_KEY = "forecast_cache";

/**
 * Save forecast payload to device storage
 * @param {ForecastPayload} payload
 * @throws {Error} - If localStorage is not available
 */
export function saveForecast(payload) {
  if (localStorage == null) {
    throw new Error("localStorage not found");
  }
  localStorage.setItem(FORECAST_KEY, JSON.stringify(payload));
  logger.debug("Forecast saved successfully for payload", payload);
}

/**
 * Load forecast from device storage
 * @returns {ForecastPayload|null}
 * @throws {Error} - If localStorage is not available
 */
export function loadForecast() {
  if (localStorage == null) {
    throw new Error("localStorage not found");
  }
  const raw = localStorage.getItem(FORECAST_KEY);
  if (raw) {
    logger.info("Found cached forecast");
    return JSON.parse(raw);
  }
  logger.info("No cached forecast");
  return null;
}