/**
 * Device Storage - Watch-local storage for caching forecast data.
 * 
 * Uses `storage` imported from @zos/storage (NOT settingsStorage).
 * This is the watch's own persistent storage.
 * 
 * Data stored here:
 * - forecast_cache: The full forecast payload received from Side Service
 * 
 * Used by: Device App (page/index/index.js)
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

const FORECAST_KEY = "forecast_cache";

import { log as Logger } from "@zos/utils";
const logger = Logger.getLogger("device.storage");


/**
 * Save forecast payload to device storage
 * @param {Object} storage - Storage object (injected, typically from @zos/storage)
 * @param {ForecastPayload} payload
 * @throws {Error} - If storage is not available
 */
export function saveForecast(storage, payload) {
  if (storage == null || !storage.setItem) {
    throw new Error("storage not found");
  }
  storage.setItem(FORECAST_KEY, JSON.stringify(payload));
  logger.debug("Forecast saved successfully for payload", payload);
}

/**
 * Load forecast from device storage
 * @param {Object} storage - Storage object (injected, typically from @zos/storage)
 * @returns {ForecastPayload|null}
 * @throws {Error} - If storage is not available
 */
export function loadForecast(storage) {
  if (storage == null || !storage.getItem) {
    throw new Error("storage not found");
  }
  const raw = storage.getItem(FORECAST_KEY);
  if (raw) {
    logger.info("Found cached forecast");
    return JSON.parse(raw);
  }
  logger.info("No cached forecast");
  return null;
}