// Settings App for Swell — runs inside the Zepp App settings environment
import { loadBeach, saveBeach, getFavorites, addFavorite, removeFavorite, getActiveTab } from "../utils/phone-storage";
import { renderTabBar, renderFavorites, renderSearch } from "./ui";

const LOG_CLASS = '[settings.index]';

AppSettingsPage({
  state: {
    activeTab: null,
    favorites: [],
    selectedBeach: null,
    searchResults: [],
    searchQuery: "",
    showToast: false,
    toastMessage: "",
  },
  build(props) {
    console.debug(LOG_CLASS, 'build initiated');
    this.getStorage(props);

    return View({ style: { padding: "12px 16px" } }, [
      renderTabBar(this.state.activeTab, props.settingsStorage),

      View(
        { style: { display: this.state.activeTab === "favorites" ? "flex" : "none" } },
        renderFavorites(props.settingsStorage, this.state.favorites, this.state.selectedBeach, this.selectBeach.bind(this), this.deleteBeach.bind(this))
      ),
      View(
        { style: { display: this.state.activeTab === "search" ? "flex" : "none" } },
        renderSearch(props.settingsStorage, this.state.searchQuery, this.state.searchResults, this.onSearchResults.bind(this), this.onAdd.bind(this))
      ),

      Toast({
        message: this.state.toastMessage,
        visible: this.state.showToast,
        duration: 2000,
      }),
    ]);
  },
  getStorage(props) {
    this.state.activeTab = getActiveTab(props.settingsStorage);
    this.state.favorites = getFavorites(props.settingsStorage);
    const selectedBeach = loadBeach(props.settingsStorage);
    this.state.selectedBeach = selectedBeach;
  },
  selectBeach(settingsStorage, beach) {
    saveBeach(settingsStorage, beach);
    this.state.selectedBeach = beach;
  },
  deleteBeach(settingsStorage, beach) {
    removeFavorite(settingsStorage, beach);
    this.state.favorites = getFavorites(settingsStorage);
  },
  onAdd(settingsStorage, beach) {
    console.log(LOG_CLASS, 'beach: ', beach);
    const shortName = beach.name.split(",")[0];
    addFavorite(settingsStorage, { name: shortName, lat: beach.lat, lon: beach.lon });
    this.state.favorites = getFavorites(settingsStorage);
    this.state.toastMessage = 'Added to favorites';
    this.state.showToast = true;
    saveBeach(settingsStorage, { name: shortName, lat: beach.lat, lon: beach.lon });
  },
  onSearchResults(settingsStorage, query) {
    console.log(LOG_CLASS, "on search results", query);
    this.state.searchQuery = query;
    if (query.length < 3) {
      this.state.searchResults = [];
      return;
    }
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) + "&layer=natural&limit=10&format=jsonv2";
    console.log(LOG_CLASS, "search url", url);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(LOG_CLASS, "search results", data);
        this.state.searchResults = data.map(item => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          name: item.display_name
        }));
        console.log(LOG_CLASS, "state", this.state.searchResults);
        // settingsStorage.setItem('_searchResults', 'true');
      })
      .catch(() => {
        this.state.searchResults = [];
        // settingsStorage.setItem('_searchResults', 'true');
      });
  }
});