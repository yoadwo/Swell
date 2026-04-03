import { BaseSideService } from "@zeppos/zml/base-side";
import { handleGetForecastRequestAsync } from "./handlers.js";

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      console.log("SideService onRequest ->", req.method);
      if (req.method === "GET_FORECAST") {
        handleGetForecastRequestAsync(settingsStorage)
          .then(payload => {
            res(null, payload);
          })
          .catch(err => {
            console.error("Error handling GET_FORECAST:", err);
            res(err);
          });
      }
    },

    onRun() {},

    onDestroy() {},
  })
);
