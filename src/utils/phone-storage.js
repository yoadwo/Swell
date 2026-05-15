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
const FAVORITES_KEY = 'favorites';
const ACTIVE_TAB_KEY = 'activeTab'; 
const LOG_CLASS = '[phone-storage]';

/**
 * Save beach selection to settingsStorage
 * @param {Object} settingsStorage - settingsStorage object (injected)
 * @param {Beach} beach - Beach object
 * @returns {boolean} - true if successful, false otherwise
 */
export function saveBeach(settingsStorage, beach) {
  try {
    if (!settingsStorage || !settingsStorage.setItem) {
      console.warn(LOG_CLASS,'settingsStorage not available');
      return false;
    }
    settingsStorage.setItem(SELECTED_BEACH_KEY, JSON.stringify(beach));
    console.log(LOG_CLASS,'Beach saved:', beach.name, beach.lat, beach.lon);
    return true;
  } catch (e) {
    console.warn(LOG_CLASS, 'Failed to save beach:', e);
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
    throw new Error(LOG_CLASS, 'settingsStorage not available');
  }
  const raw = settingsStorage.getItem(SELECTED_BEACH_KEY);
  if (raw) {
    const beach = JSON.parse(raw);
    console.debug(LOG_CLASS, 'Beach loaded:', beach.name, beach.lat, beach.lon);
    return beach;
  }
  console.debug(LOG_CLASS, 'No beach found');
  return null;
}

export function getFavorites(settingsStorage) {
  if (!settingsStorage || !settingsStorage.getItem) {
    return [];
  }
  const raw = settingsStorage.getItem(FAVORITES_KEY);
  if (raw) {
    const favorites = JSON.parse(raw);
    console.debug(LOG_CLASS, 'Favorites loaded:', favorites);
    return favorites;
  }
  console.debug(LOG_CLASS, 'No favorites found');
  return [];
}

export function addFavorite(settingsStorage, beach) {
  if (!settingsStorage || !settingsStorage.setItem) {
    return;
  }
  const favorites = getFavorites(settingsStorage);
  if (!favorites.find(f => f.lat === beach.lat && f.lon === beach.lon)) {
    favorites.push(beach);
    settingsStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    console.debug(LOG_CLASS, 'Favorite added:', beach.name);
  }
}

export function removeFavorite(settingsStorage, beach) {
  if (!settingsStorage || !settingsStorage.setItem) {
    return;
  }
  let favorites = getFavorites(settingsStorage);
  favorites = favorites.filter(f => !(f.lat === beach.lat && f.lon === beach.lon));
  settingsStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  console.debug(LOG_CLASS, 'Favorite removed:', beach.name);
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
  console.debug(LOG_CLASS, 'Active tab set:', tab);
  settingsStorage.setItem(ACTIVE_TAB_KEY, tab);
}

/**
 * Get active tab from settingsStorage
 * @param {Object} settingsStorage - settingsStorage object
 * @returns {string|null} - Active tab or null if not set
 */
export function getActiveTab(settingsStorage) {
  if (!settingsStorage || !settingsStorage.getItem) {
    return "favorites";
  }
  const tab = settingsStorage.getItem(ACTIVE_TAB_KEY);
  console.debug(LOG_CLASS, 'Active tab get:', tab);
  return tab || "favorites";
}