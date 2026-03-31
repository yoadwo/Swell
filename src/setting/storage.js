/**
 * Beach storage logic - pure functions for save/load
 * Separated from UI concerns for testability
 */

const SELECTED_BEACH_KEY = 'selectedBeach';

/**
 * Save beach selection to storage
 * @param {Object} storage - settingsStorage object
 * @param {Object} beach - Beach object {name, lat, lon}
 * @returns {boolean} - true if successful, false otherwise
 */
export function saveBeach(storage, beach) {
  try {
    if (!storage || !storage.setItem) {
      console.warn('Storage not available');
      return false;
    }
    storage.setItem(SELECTED_BEACH_KEY, JSON.stringify(beach));
    console.log('Beach saved to storage:', beach.name);
    return true;
  } catch (e) {
    console.warn('Failed to save selected beach:', e);
    return false;
  }
}

/**
 * Load beach selection from storage
 * @param {Object} storage - settingsStorage object
 * @returns {Object|null} - Beach object {name, lat, lon} or null if not found
 */
export function loadBeach(storage) {
  try {
    if (!storage || !storage.getItem) {
      console.warn('Storage not available');
      return null;
    }
    const raw = storage.getItem(SELECTED_BEACH_KEY);
    if (raw) {
      const beach = JSON.parse(raw);
      console.log('Beach loaded from storage:', beach.name);
      return beach;
    }
    console.log('No beach found in storage');
    return null;
  } catch (e) {
    console.warn('Failed to read selected beach:', e);
    return null;
  }
}
