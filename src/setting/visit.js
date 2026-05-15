/**
 * Settings App visit scope — no onDestroy/onShow in Zepp; only `build` exists.
 * A new JS load (refresh, re-enter settings) resets this flag so search can be cleared once.
 */
import { clearSearchSession } from "../utils/phone-storage";

const LOG_CLASS = '[settings.visit]';
let visitInitialized = false;

/**
 * Clears ephemeral search session once per settings JS context (new visit).
 * @param {Object} settingsStorage
 */
export function ensureFreshVisit(settingsStorage) {
  if (visitInitialized) {
    return;
  }
  visitInitialized = true;
  clearSearchSession(settingsStorage);
}
