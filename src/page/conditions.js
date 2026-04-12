import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../utils/device-storage";
import { CONDITIONS_PAGE_LAYOUT } from "./conditions.r.layout";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../utils/gestures";
import { setScrollMode, SCROLL_MODE_NORMAL } from "@zos/page";

const logger = Logger.getLogger("page.conditions");

let waveWidget, windWidget, waterTempWidget, sunriseSunsetWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building conditions page");
      setupGestures(1);

      setScrollMode({ mode: SCROLL_MODE_NORMAL });

      waveWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE,
      });

      windWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WIND,
      });

      waterTempWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WATER_TEMP,
      });

      sunriseSunsetWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.SUNRISE_SUNSET,
      });

      let cached = null;
      try {
        cached = loadForecast();
        logger.info("Loaded forecast from device storage:", cached.beach);
      } catch (e) {
        logger.warn(`Could not load forecast: ${e.message}`);
      }

      if (cached && cached.current) {
        this.renderConditions(cached);
      } else {
        this.renderNoData();
      }
    },

    renderConditions(data) {
      logger.debug("Rendering conditions");
      const c = data.current;

      waveWidget.setProperty(
        hmUI.prop.TEXT,
        `🌊\n${c.swell.height.toFixed(1)}m\n${c.swell.period}s\n${formatDir(c.swell.direction)}`
      );

      windWidget.setProperty(
        hmUI.prop.TEXT,
        `💨\n${c.wind.speed} km/h\n${formatDir(c.wind.direction)}`
      );

      waterTempWidget.setProperty(
        hmUI.prop.TEXT,
        `🌡️\n${c.waterTemp}°C`
      );

      sunriseSunsetWidget.setProperty(
        hmUI.prop.TEXT,
        `🌅 ${data.sunrise}\n🌇 ${data.sunset}`
      );
    },

    renderNoData() {
      logger.debug("Rendering no data");
      waveWidget.setProperty(hmUI.prop.TEXT, "🌊\n-\n-\n-");
      windWidget.setProperty(hmUI.prop.TEXT, "💨\n-\n-");
      waterTempWidget.setProperty(hmUI.prop.TEXT, "🌡️\n-");
      sunriseSunsetWidget.setProperty(hmUI.prop.TEXT, "🌅 -\n🌇 -");
    },
  })
);

function formatDir(direction) {
  if (direction === null || direction === undefined) {
    return "-";
  }
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const idx = Math.round(direction / 45) % 8;
  return `${directions[idx]} ${arrows[idx]}`;
}