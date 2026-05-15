// Settings App for Swell — runs inside the Zepp App settings environment
import {
  loadBeach,
  saveBeach,
  getFavorites,
  addFavorite,
  removeFavorite,
  getActiveTab,
  getSearchSession,
  saveSearchSession,
  showToast,
  clearToast,
  getToast,
} from "../utils/phone-storage";
import { renderTabBar, renderFavorites, renderSearch } from "./ui";
import { ensureFreshVisit } from "./visit";

const LOG_CLASS = '[settings.index]';
const TOAST_DURATION_MS = 2000;

AppSettingsPage({
  state: {
    activeTab: null,
    favorites: [],
    selectedBeach: null,
    searchResults: [],
    searchQuery: "",
    searchLoading: false,
    showToast: false,
    toastMessage: "",
  },
  build(props) {
    console.debug(LOG_CLASS, 'build initiated');
    ensureFreshVisit(props.settingsStorage);
    this.getStorage(props);

    return View({ style: { padding: "12px 16px" } }, [
      renderTabBar(this.state.activeTab, props.settingsStorage),

      View(
        { style: { display: this.state.activeTab === "favorites" ? "flex" : "none" } },
        renderFavorites(props.settingsStorage, this.state.favorites, this.state.selectedBeach, this.selectBeach.bind(this), this.deleteBeach.bind(this))
      ),
      View(
        { style: { display: this.state.activeTab === "search" ? "flex" : "none" } },
        renderSearch(
          props.settingsStorage,
          this.state.searchQuery,
          this.state.searchLoading,
          this.state.searchResults,
          this.onSearchResults.bind(this),
          this.onAdd.bind(this)
        )
      ),

      Toast({
        message: this.state.toastMessage,
        visible: this.state.showToast,
        duration: TOAST_DURATION_MS,
      }),
    ]);
  },
  getStorage(props) {
    const { settingsStorage } = props;
    this.state.activeTab = getActiveTab(settingsStorage);
    this.state.favorites = getFavorites(settingsStorage);
    this.state.selectedBeach = loadBeach(settingsStorage);

    const session = getSearchSession(settingsStorage);
    this.state.searchQuery = session.query;
    this.state.searchLoading = session.loading;
    this.state.searchResults = [];
    if (!session.loading) {
      this.state.searchResults = session.results;
    }

    const toast = getToast(settingsStorage);
    this.state.showToast = toast.visible;
    this.state.toastMessage = toast.message;
    console.debug(LOG_CLASS, 'state hydrated from storage');
  },
  selectBeach(settingsStorage, beach) {
    console.log(LOG_CLASS, 'select beach:', beach.name);
    saveBeach(settingsStorage, beach);
  },
  deleteBeach(settingsStorage, beach) {
    console.log(LOG_CLASS, 'delete beach:', beach.name);
    removeFavorite(settingsStorage, beach);
  },
  onAdd(settingsStorage, beach) {
    console.log(LOG_CLASS, 'add beach:', beach.name);
    const shortName = beach.name.split(",")[0];
    const beachEntry = { name: shortName, lat: beach.lat, lon: beach.lon };
    addFavorite(settingsStorage, beachEntry);
    saveBeach(settingsStorage, beachEntry);
    showToast(settingsStorage, 'Added to favorites');
    setTimeout(() => clearToast(settingsStorage), TOAST_DURATION_MS);
  },
  onSearchResults(settingsStorage, query) {
    console.log(LOG_CLASS, 'on search:', query);
    if (query.length < 3) {
      saveSearchSession(settingsStorage, { query, results: [], loading: false });
      return;
    }
    saveSearchSession(settingsStorage, { query, results: [], loading: true });
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) + "&layer=natural&limit=10&format=jsonv2";
    console.log(LOG_CLASS, 'search url:', url);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(LOG_CLASS, 'search results count:', data.length);
        const results = data.map(item => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          name: item.display_name,
        }));
        saveSearchSession(settingsStorage, { query, results, loading: false });
      })
      .catch((err) => {
        console.warn(LOG_CLASS, 'search failed:', err);
        saveSearchSession(settingsStorage, { query, results: [], loading: false });
      });
  },
});
