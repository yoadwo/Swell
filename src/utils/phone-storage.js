/**
 * Phone Storage - Wrapper for settingsStorage (Zepp App on phone).
 * 
 * This is NOT device storage (@zos/storage) — this is settingsStorage,
 * which is shared between the Settings App and Side Service, both running
 * on the phone inside the Zepp App.
 * 
 */

/**
 * @typedef {Object} Beach
 * @property {string} name - Beach name
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 */

const SELECTED_BEACH_KEY = 'selectedBeach';
const ACTIVE_TAB_KEY = 'activeTab';

/**
 * Save beach selection to settingsStorage
 * @param {Object} settingsStorage - settingsStorage object (injected)
 * @param {Beach} beach - Beach object
 * @returns {boolean} - true if successful, false otherwise
 */
export function saveBeach(settingsStorage, beach) {
  try {
    if (!settingsStorage || !settingsStorage.setItem) {
      console.warn('[phone-storage] settingsStorage not available');
      return false;
    }
    settingsStorage.setItem(SELECTED_BEACH_KEY, JSON.stringify(beach));
    console.log('[phone-storage] Beach saved:', beach.name);
    return true;
  } catch (e) {
    console.warn('[phone-storage] Failed to save beach:', e);
    return false;
  }
}

/**
 * Load beach selection from settingsStorage
 * @param {Object} settingsStorage - settingsStorage object (injected)
 * @returns {Beach|null} - Beach object or null if not found
 */
export function loadBeach(settingsStorage) {
  if (!settingsStorage || !settingsStorage.getItem) {
    throw new Error('[phone-storage] settingsStorage not available');
  }
  const raw = settingsStorage.getItem(SELECTED_BEACH_KEY);
  if (raw) {
    const beach = JSON.parse(raw);
    console.debug('[phone-storage] Beach loaded:', beach.name);
    return beach;
  }
  console.debug('[phone-storage] No beach found');
  return null;
}

/**
 * Get active tab from settingsStorage
 * @param {Object} settingsStorage - settingsStorage object
 * @returns {string|null} - Active tab or null if not set
 */
export function getActiveTab(settingsStorage) {
  if (!settingsStorage || !settingsStorage.getItem) {
    return null;
  }
  const tab = settingsStorage.getItem(ACTIVE_TAB_KEY);
  console.log('[phone-storage] Active tab get:', tab);
  return tab;
}

/**
 * Set active tab in settingsStorage
 * @param {Object} settingsStorage - settingsStorage object
 * @param {string} tab - Tab key
 */
export function setActiveTab(settingsStorage, tab) {
  if (!settingsStorage || !settingsStorage.setItem) {
    return;
  }
  console.log('[phone-storage] Active tab set:', tab);
  settingsStorage.setItem(ACTIVE_TAB_KEY, tab);
}