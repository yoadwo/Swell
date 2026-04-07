import { BaseSideService, settingsLib } from "@zeppos/zml/base-side";
import { handleGetForecastRequestAsync } from "./handlers.js";
import { createHttpClient, createMockHttpClient } from "../utils/http.js";


// const httpClient = createHttpClient();
const httpClient = createMockHttpClient("medium");

AppSideService(
  BaseSideService({
    onInit() { },

    onRequest(req, res) {
      console.log("SideService onRequest ->", req.method);
      if (req.method === "GET_FORECAST") {
        handleGetForecastRequestAsync(settingsLib, httpClient)
          .then(payload => {
            res(null, payload);
          })
          .catch(err => {
            console.error("Error handling GET_FORECAST:", err);
            res({ error: err.message || String(err) });
          });
      }
    },

    onRun() { },

    onDestroy() { },
  })
);
