// Settings App for Swell — runs inside the Zepp App settings environment
import { loadBeach, getActiveTab } from "../utils/phone-storage";
import { renderTabBar, renderBeachesIndex, renderBeachesSearch, renderSettings, setSelectedBeach } from "./ui";

const TAB_BEACHES_INDEX = "beaches-index";
const TAB_BEACHES_SEARCH = "beaches-search";
const TAB_SETTINGS = "settings";

let activeTab = TAB_BEACHES_INDEX;

function handleLoadState(settingsStorage) {
  const selectedBeach = loadBeach(settingsStorage);
  activeTab = getActiveTab(settingsStorage) || TAB_BEACHES_INDEX;
  setSelectedBeach(selectedBeach);
}

AppSettingsPage({
  build(props) {
    handleLoadState(props.settingsStorage);

    return View({ style: { padding: "12px 16px" } }, [
      renderTabBar(activeTab, props.settingsStorage),

      // Tab content
      View(
        { style: { display: activeTab === TAB_BEACHES_INDEX ? "flex" : "none" } },
        renderBeachesIndex(props.settingsStorage)
      ),
      View(
        { style: { display: activeTab === TAB_BEACHES_SEARCH ? "flex" : "none" } },
        renderBeachesSearch()
      ),
      View(
        { style: { display: activeTab === TAB_SETTINGS ? "flex" : "none" } },
        renderSettings()
      ),
    ]);
  },
});