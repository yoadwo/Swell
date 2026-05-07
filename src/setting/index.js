// Settings App for Swell — runs inside the Zepp App settings environment
import { loadBeach, getActiveTab, getSelectedCountry } from "../utils/phone-storage";
import { renderTabBar, renderBeachesIndex, renderBeachesSearch, renderSettings, setSelectedBeach } from "./ui";

 

AppSettingsPage({
  state: {
    activeTab: null,
    selectedCountry: null,
    selectedBeach: null,
  },
  build(props) {
    this.getStorage(props);

    return View({ style: { padding: "12px 16px" } }, [
      renderTabBar(this.state.activeTab, props.settingsStorage),

      View(
        { style: { display: this.state.activeTab === "beaches-index" ? "flex" : "none" } },
        renderBeachesIndex(props.settingsStorage, this.state.selectedBeach, this.state.selectedCountry)
      ),
      View(
        { style: { display: this.state.activeTab === "beaches-search" ? "flex" : "none" } },
        renderBeachesSearch()
      ),
      View(
        { style: { display: this.state.activeTab === "settings" ? "flex" : "none" } },
        renderSettings()
      ),
    ]);
  },
  getStorage(props) {
    this.state.activeTab = getActiveTab(props.settingsStorage);
    this.state.selectedCountry = getSelectedCountry(props.settingsStorage);
    const selectedBeach = loadBeach(props.settingsStorage);
    this.state.selectedBeach = selectedBeach;
    setSelectedBeach(selectedBeach);
  }
});