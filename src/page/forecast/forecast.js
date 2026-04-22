import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../../utils/device-storage";
import { FORECAST_PAGE_LAYOUT } from "./forecast.r.layout";
import { log as Logger } from "@zos/utils";
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";
import { localStorage } from "@zos/storage";
import { formatDirection } from "../ui-helpers";
import { getTrafficLightState } from "../../utils/score";
import { setupGestures } from "../../utils/gestures";

const logger = Logger.getLogger("page.forecast");

Page(
  BasePage({
    build() {
      logger.debug("Building forecast page");

      setupGestures(2);
      setScrollMode({
        mode: SCROLL_MODE_FREE,
        options: {
          modeParams: {
            bounce: false,
          },
        },
      });

      let cached = null;
      try {
        cached = loadForecast(localStorage);
        logger.info("Loaded forecast:", cached?.beach);
      } catch (e) {
        logger.warn(`Could not load forecast: ${e.message}`);
      }

      const days = cached?.forecast || [];
      const dayCount = Math.min(days.length, 5);

      for (let i = 0; i < dayCount; i++) {
        const day = days[i];
        const state = getTrafficLightState(day.score);
        const color = state.color;
        const rowY = 50 + i * 90;

        hmUI.createWidget(hmUI.widget.TEXT, {
          ...FORECAST_PAGE_LAYOUT.ROW_DAY,
          y: rowY,
          text: day.day,
        });

        hmUI.createWidget(hmUI.widget.TEXT, {
          ...FORECAST_PAGE_LAYOUT.ROW_WAVE,
          y: rowY + 30,
          text: `🌊 ${day.waveHeightMin.toFixed(1)}–${day.waveHeightMax.toFixed(1)}m`,
        });

        // hmUI.createWidget(hmUI.widget.TEXT, {
        //   ...FORECAST_PAGE_LAYOUT.ROW_PERIOD,
        //   y: rowY + 30,
        //   text: `⏱️ ${day.period}s`,
        // });

        hmUI.createWidget(hmUI.widget.TEXT, {
          ...FORECAST_PAGE_LAYOUT.ROW_WIND,
          y: rowY + 60,
          text: `💨 ${day.windSpeed} km/h ${formatDirection(day.windDirection, true)}`,
        });

        hmUI.createWidget(hmUI.widget.TEXT, {
          ...FORECAST_PAGE_LAYOUT.ROW_SCORE,
          y: rowY + 60,
          // text: `Score: ${day.score}`,
          text: day.score,
          color: color,
        });
      }

      if (dayCount === 0) {
        hmUI.createWidget(hmUI.widget.TEXT, {
          ...FORECAST_PAGE_LAYOUT.NO_DATA,
          text: "No forecast data",
        });
      }
    },
  })
);