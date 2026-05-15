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
const SEARCH_SESSION_KEY = 'searchSession';
const SEARCH_QUERY_KEY = 'searchQuery';
const SEARCH_RESULTS_KEY = 'searchResults';
const TOAST_KEY = 'toast';
const LOG_CLASS = '[phone-storage]';

/** @typedef {{ query: string, results: Array<{name:string,lat:number,lon:number}>, loading: boolean, updatedAt?: number }} SearchSession */

const EMPTY_SEARCH_SESSION = { query: '', results: [], loading: false };

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

function removeSearchKeys(settingsStorage) {
  if (!settingsStorage?.removeItem) {
    return;
  }
  if (settingsStorage.getItem(SEARCH_QUERY_KEY)) {
    settingsStorage.removeItem(SEARCH_QUERY_KEY);
  }
  if (settingsStorage.getItem(SEARCH_RESULTS_KEY)) {
    settingsStorage.removeItem(SEARCH_RESULTS_KEY);
  }
}

/**
 * @param {Object} settingsStorage
 * @returns {SearchSession}
 */
export function getSearchSession(settingsStorage) {
  if (!settingsStorage?.getItem) {
    return { ...EMPTY_SEARCH_SESSION };
  }

  const raw = settingsStorage.getItem(SEARCH_SESSION_KEY);
  if (!raw) {
    console.debug(LOG_CLASS, 'No search session found');
    return { ...EMPTY_SEARCH_SESSION };
  }

  const parsed = JSON.parse(raw);
  const session = normalizeSearchSession(parsed);
  console.debug(LOG_CLASS, 'Search session loaded:', session.loading, session.results.length);
  return session;
}

/** @param {object} raw */
function normalizeSearchSession(raw) {
  if (typeof raw.loading === 'boolean') {
    return {
      query: raw.query || '',
      results: raw.results || [],
      loading: raw.loading,
    };
  }
  const loading = raw.status === 'loading';
  return {
    query: raw.query || '',
    results: loading ? [] : (raw.results || []),
    loading,
  };
}

/**
 * @param {Object} settingsStorage
 * @param {SearchSession} session
 */
export function saveSearchSession(settingsStorage, session) {
  if (!settingsStorage?.setItem) {
    return;
  }
  removeSearchKeys(settingsStorage);
  const payload = { ...session, updatedAt: Date.now() };
  settingsStorage.setItem(SEARCH_SESSION_KEY, JSON.stringify(payload));
  console.debug(LOG_CLASS, 'Search session saved:', payload.loading, payload.results.length);
}

export function clearSearchSession(settingsStorage) {
  removeSearchKeys(settingsStorage);
  saveSearchSession(settingsStorage, { ...EMPTY_SEARCH_SESSION });
  console.debug(LOG_CLASS, 'Search session cleared');
}

export function showToast(settingsStorage, message) {
  if (!settingsStorage || !settingsStorage.setItem) {
    return;
  }
  settingsStorage.setItem(TOAST_KEY, JSON.stringify({ visible: true, message }));
  console.debug(LOG_CLASS, 'Toast shown:', message);
}

export function clearToast(settingsStorage) {
  if (!settingsStorage || !settingsStorage.setItem) {
    return;
  }
  settingsStorage.setItem(TOAST_KEY, JSON.stringify({ visible: false, message: "" }));
  console.debug(LOG_CLASS, 'Toast cleared');
}

export function getToast(settingsStorage) {
  if (!settingsStorage || !settingsStorage.getItem) {
    return { visible: false, message: "" };
  }
  const raw = settingsStorage.getItem(TOAST_KEY);
  if (!raw) {
    return { visible: false, message: "" };
  }
  const toast = JSON.parse(raw);
  // log is missing on purpose
  // it's not a very important log
  return toast;
}