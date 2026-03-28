import { BaseSideService } from "@zeppos/zml/base-side";

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      console.log("SideService onRequest ->", req.method);
      if (req.method === "GET_FORECAST") {
        // Read selected beach from settingsStorage if available (best-effort)
        let beach = { name: "Frishman", lat: 32.0949, lon: 34.7726 };
        console.log('Attempting to read selected beach from settingsStorage...');
        // TODO: not working, this is FR-7, return a mock for now
        try {
          // settingsStorage is available in the Zepp settings environment
          if (typeof settingsStorage !== 'undefined' && settingsStorage.getItem) {
            const raw = settingsStorage.getItem('selectedBeach');
            console.log('got raw string from storage: ', raw);
            if (raw) {
              beach = JSON.parse(raw);
              console.log('Successfully parsed beach from storage:', beach);
            } else {
              console.log('No beach found in storage, using default:', beach);
            }
          }
        } catch (e) {
          console.warn('Failed to read settingsStorage:', e);
        }

        // Placeholder normalized payload (matches PLAN/PRD shape)
        const now = Math.floor(Date.now() / 1000);
        const hourly = [];
        for (let i = 0; i < 24; i++) {
          hourly.push({
            time: now + i * 3600,
            waveHeight: Math.round((0.5 + Math.sin(i / 3) * 0.8) * 10) / 10,
            score: Math.max(0, Math.min(10, Math.round((5 + Math.sin(i / 4) * 3) * 10) / 10)),
          });
        }
        
        const payload = {
          beach: beach.name,
          updatedAt: now,
          current: {
            waveHeight: hourly[0].waveHeight,
            wavePeriod: 10,
            waveDirection: 315,
            windSpeed: 8,
            windDirection: 45,
            waterTemp: 18,
          },
          hourly,
        };
        console.log('Responding with payload:', payload);
        // Respond with compact payload
        res(null, payload);
      }
    },

    onRun() {},

    onDestroy() {},
  })
);
