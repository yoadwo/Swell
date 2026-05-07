// Settings UI - rendering functions separated from AppSettingsPage
import { ISRAEL_BEACHES } from "./beaches";
import { saveBeach, setActiveTab } from "../utils/phone-storage";

const TAB_BEACHES_INDEX = "beaches-index";
const TAB_BEACHES_SEARCH = "beaches-search";
const TAB_SETTINGS = "settings";

let selectedBeach = null;

export function setSelectedBeach(beach) {
  selectedBeach = beach;
}

function handleSelectBeach(settingsStorage, beach) {
  selectedBeach = beach;
  saveBeach(settingsStorage, beach);
}

function handleTabClick(settingsStorage, tab) {
  setActiveTab(settingsStorage, tab);
}

export function renderTabBar(activeTab, settingsStorage) {
  const tabs = [
    { key: TAB_BEACHES_INDEX, label: "Beaches" },
    { key: TAB_BEACHES_SEARCH, label: "Search" },
    { key: TAB_SETTINGS, label: "Settings" },
  ];

  return View(
    { style: { display: "flex", flexDirection: "row", marginBottom: "16px" } },
    tabs.map((tab) => {
      const isActive = activeTab === tab.key;
      return Button({
        label: tab.label,
        style: {
          flex: 1,
          background: isActive ? "#0ea5e9" : "#f8fafc",
          color: isActive ? "white" : "#64748b",
          marginRight: "8px",
          padding: "10px 0",
          borderRadius: "4px",
          fontSize: "14px",
        },
        onClick: () => handleTabClick(settingsStorage, tab.key),
      });
    })
  );
}

export function renderBeachesIndex(settingsStorage) {
  return View({}, [
    Text({ style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } }, [
      selectedBeach ? "Change Beach" : "Select Your Beach",
    ]),
    ...ISRAEL_BEACHES.map((beach) => {
      const isSelected = selectedBeach && selectedBeach.name === beach.name;
      return View(
        {
          key: beach.name,
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px",
            marginBottom: "8px",
            background: isSelected ? "#e0f2fe" : "#f8fafc",
            borderRadius: "8px",
            border: isSelected ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
          },
        },
        [
          Text({ style: { fontSize: "16px", fontWeight: isSelected ? "bold" : "normal" } }, [beach.name]),
          Button({
            label: isSelected ? "Selected" : "Select",
            style: {
              background: isSelected ? "#0ea5e9" : "#3b82f6",
              color: "white",
              padding: "8px 16px",
              borderRadius: "4px",
            },
            onClick: () => handleSelectBeach(settingsStorage, beach),
          }),
        ]
      );
    }),
  ]);
}

export function renderBeachesSearch() {
  return View({}, [
    Text({ style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } }, ["Search Beach"]),
    Text({ style: { fontSize: "14px", color: "#64748b" } }, [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    ]),
  ]);
}

export function renderSettings() {
  return View({}, [
    Text({ style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } }, ["Settings"]),
    Text({ style: { fontSize: "14px", color: "#64748b" } }, [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    ]),
  ]);
}