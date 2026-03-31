// Settings App for Swell — runs inside the Zepp App settings environment
import { ISRAEL_BEACHES } from "./beaches";
import { saveBeach, loadBeach } from "./storage";

AppSettingsPage({
  state: {
    selectedBeach: null,
    settingsStorage: null,
  },

  setState(props) {
    this.state.settingsStorage = props.settingsStorage;
    this.state.selectedBeach = loadBeach(props.settingsStorage);
  },

  handleSelectBeach(beach) {
    if (saveBeach(this.state.settingsStorage, beach)) {
      this.state.selectedBeach = beach;
    }
  },

  build(props) {
    this.setState(props);

    return View(
      { style: { padding: '12px 16px' } },
      [
        Text(
          { style: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' } },
          ['Select Your Beach']
        ),
        ...ISRAEL_BEACHES.map((beach) => {
          const isSelected = this.state.selectedBeach && this.state.selectedBeach.name === beach.name;
          return View(
            {
              key: beach.name,
              style: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                background: isSelected ? '#e0f2fe' : '#f8fafc',
                borderRadius: '8px',
                border: isSelected ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
              },
            },
            [
              Text(
                { style: { fontSize: '16px', fontWeight: isSelected ? 'bold' : 'normal' } },
                [beach.name]
              ),
              Button({
                label: isSelected ? 'Selected' : 'Select',
                style: {
                  background: isSelected ? '#0ea5e9' : '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                },
                onClick: () => {
                  this.handleSelectBeach(beach);
                },
              }),
            ]
          );
        }),
      ]
    );
  },
});
