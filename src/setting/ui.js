// Settings UI - rendering functions separated from AppSettingsPage
import { setActiveTab  } from "../utils/phone-storage";

const LOG_CLASS = '[settings.ui]';


export function renderTabBar(activeTab, settingsStorage) {
  console.debug(LOG_CLASS, 'rendering tab bar...');
  return View(
    { style: { display: "flex", flexDirection: "row", marginBottom: "16px" } },
    [
      { key: "favorites", label: "Favorites" },
      { key: "search", label: "Search" },
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

export function renderFavorites(settingsStorage, favorites, selectedBeach, onSelect, onDelete) {
  console.debug(LOG_CLASS, 'rendering favorites...');
  return View({}, [
    Text({ style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" } }, "Favorites"),
    favorites.length === 0
      ? Text({ style: { fontSize: "14px", color: "#64748b" } }, "No favorites yet. Use Search to add beaches.")
      : favorites.map((beach) => {
          const isSelected = selectedBeach && beach.name === selectedBeach.name;
          return View(
            {
              key: beach.lat + "-" + beach.lon,
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
              View({ style: { flex: 1, marginRight: "8px" } }, [
                Text({ style: { fontSize: "14px", fontWeight: isSelected ? "bold" : "normal" } }, [beach.name]),
              ]),
              Button({
                label: isSelected ? "Selected" : "Select",
                style: {
                  background: isSelected ? "#0ea5e9" : "#3b82f6",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginRight: "8px",
                },
                onClick: () => onSelect(settingsStorage, beach),
              }),
              Button({
                label: "Delete",
                style: {
                  background: "#ef4444",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                },
                onClick: () => onDelete(settingsStorage, beach),
              }),
            ]
          );
        }),
  ]);
}

export function renderSearch(settingsStorage, searchQuery, searchResults, onSearch, onAdd) {
  console.debug(LOG_CLASS, 'rendering search...');
  return View({}, [
    TextInput({
      label: "Search Surf Location",
      placeholder: "surf spots, i.e. arugam bay, sri lanka",
      value: searchQuery,
      onChange: (val) => onSearch(settingsStorage, val),
    }),
    searchResults.length > 0
      ? View({}, [
          Text({ style: { fontSize: "14px", color: "#64748b", marginBottom: "8px" } }, "Results:"),
          ...searchResults.slice(0, 10).map((result) => {
            console.log("[setting-app] result: ", result);
            const shortName = result.name.split(",")[0];
            return View(
              {
                key: result.lat + "-" + result.lon,
                style: {
                  padding: "12px",
                  marginTop: "4px",
                  marginBottom: "4px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                },
              },
              [
                View({ style: { flex: 1 } }, [
                  Text({ style: { fontSize: "14px", marginBottom: "4px" } }, [shortName]),
                  Text({ style: { fontSize: "12px", color: "#64748b" } }, [result.lat.toFixed(4) + ", " + result.lon.toFixed(4)]),
                ]),
                Button({
                  label: "Add",
                  style: {
                    background: "#10b981",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  },
                  onClick: () => onAdd(settingsStorage, result),
                }),
              ]
            );
          }),
        ])
      : searchQuery.length >= 3
      ? Text({ style: { fontSize: "14px", color: "#64748b" } }, "No results found.")
      : Text({ style: { fontSize: "14px", color: "#64748b" } }, "Enter at least 3 characters to search."),
  ]);
}