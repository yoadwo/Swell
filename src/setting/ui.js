// Settings UI - rendering functions separated from AppSettingsPage
import { getCountryByCode, getAllCountryOptions } from "./beaches";
import { saveBeach, setActiveTab, getSelectedCountry, setSelectedCountry } from "../utils/phone-storage";

export function renderTabBar(activeTab, settingsStorage) {
  return View(
    { style: { display: "flex", flexDirection: "row", marginBottom: "16px" } },
    [
      { key: "beaches-index", label: "Beaches" },
      { key: "beaches-search", label: "Search" },
      { key: "settings", label: "Settings" },
    ].map((tab) => {
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
        onClick: () => setActiveTab(settingsStorage, tab.key),
      });
    })
  );
}

export function renderBeachesIndex(settingsStorage, selectedBeach, countryCode) {
  const country = countryCode ? getCountryByCode(countryCode) : null;
  const beaches = country ? country.beaches : [];

  return View({}, [
    Text({ style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } }, "Select Your Beach"),
    Select({
      options: getAllCountryOptions(),
      value: countryCode || "israel",
      onChange: (val) => setSelectedCountry(settingsStorage, val),
    }),
    country && countryCode
      ? View({}, [
          ...beaches.map((beach) => {
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
                  marginTop: "8px",
                  marginBottom: "8px",
                  background: isSelected ? "#e0f2fe" : "#f8fafc",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
                },
              },
              [
                Text({ style: { fontSize: "16px", fontWeight: isSelected ? "bold" : "normal" } }, [
                  beach.name,
                ]),
                Button({
                  label: isSelected ? "Selected" : "Select",
                  style: {
                    background: isSelected ? "#0ea5e9" : "#3b82f6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                  },
                  onClick: () => {
                    selectedBeach = beach;
                    saveBeach(settingsStorage, beach);
                  },
                }),
              ]
            );
          }),
        ])
      : null,
  ]);
}

export function renderBeachesSearch() {
  return View({}, [
    Text(
      { style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } },
      ["Search Beach"]
    ),
    Text({ style: { fontSize: "14px", color: "#64748b" } }, [
      "Lorem ipsum dolor sit amet.",
    ]),
  ]);
}

export function renderSettings() {
  return View({}, [
    Text(
      { style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } },
      ["Settings"]
    ),
    Text({ style: { fontSize: "14px", color: "#64748b" } }, [
      "Lorem ipsum dolor sit amet.",
    ]),
  ]);
}