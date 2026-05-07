// Settings App for Swell — runs inside the Zepp App settings environment
import { loadBeach, getActiveTab, getSelectedCountry } from "../utils/phone-storage";
import { renderTabBar, renderBeachesIndex, renderBeachesSearch, renderSettings, setSelectedBeach } from "./ui";

function handleLoadState(settingsStorage) {
  setSelectedBeach(loadBeach(settingsStorage));
}

AppSettingsPage({
  build(props) {
    const activeTab = getActiveTab(props.settingsStorage);
    const selectedCountry = getSelectedCountry(props.settingsStorage);

    handleLoadState(props.settingsStorage);

    return View({ style: { padding: "12px 16px" } }, [
      renderTabBar(activeTab, props.settingsStorage),

      View(
        { style: { display: activeTab === "beaches-index" ? "flex" : "none" } },
        renderBeachesIndex(props.settingsStorage, selectedCountry)
      ),
      View(
        { style: { display: activeTab === "beaches-search" ? "flex" : "none" } },
        renderBeachesSearch()
      ),
      View(
        { style: { display: activeTab === "settings" ? "flex" : "none" } },
        renderSettings()
      ),
    ]);
  },
});