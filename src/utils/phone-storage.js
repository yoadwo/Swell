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

/**
 * Save beach selection to settingsStorage
 * @param {Object} settingsStorage - settingsStorage object (injected)
 * @param {Beach} beach - Beach object
 * @returns {boolean} - true if successful, false otherwise
 */
export function saveBeach(settingsStorage, beach) {
  try {
    if (!settingsStorage || !settingsStorage.setItem) {
      console.warn('settingsStorage not available');
      return false;
    }
    settingsStorage.setItem(SELECTED_BEACH_KEY, JSON.stringify(beach));
    console.log('Beach saved to settingsStorage:', beach.name);
    return true;
  } catch (e) {
    console.warn('Failed to save beach:', e);
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
    throw new Error('settingsStorage not available');
  }
  const raw = settingsStorage.getItem(SELECTED_BEACH_KEY);
  if (raw) {
    const beach = JSON.parse(raw);
    console.debug('Beach loaded from settingsStorage:', beach);
    return beach;
  }
  console.debug('No beach found in settingsStorage');
  return null;
}
