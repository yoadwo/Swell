const FORECAST_KEY = "forecast_cache";

export function saveForecast(payload) {
  try {
    if (typeof storage !== 'undefined' && storage.setItem) {
      storage.setItem(FORECAST_KEY, JSON.stringify(payload));
    }
  } catch (e) {
    console.warn('saveForecast failed', e);
  }
}

export function loadForecast() {
  try {
    if (typeof storage !== 'undefined' && storage.getItem) {
      const raw = storage.getItem(FORECAST_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('loadForecast failed', e);
  }
  return null;
}

export function clearForecast() {
  try {
    if (typeof storage !== 'undefined' && storage.removeItem) {
      storage.removeItem(FORECAST_KEY);
    }
  } catch (e) {
    console.warn('clearForecast failed', e);
  }
}
