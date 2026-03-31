import { BaseSideService } from "@zeppos/zml/base-side";
import { handleGetForecastRequest } from "./handlers";

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      console.log("SideService onRequest ->", req.method);
      if (req.method === "GET_FORECAST") {
        const payload = handleGetForecastRequest(settingsStorage);
        res(null, payload);
      }
    },

    onRun() {},

    onDestroy() {},
  })
);
