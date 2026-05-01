import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../../utils/device-storage";
import { CONDITIONS_PAGE_LAYOUT } from "zosLoader:./conditions.[pf].layout.js";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../../utils/gestures";
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";
import { localStorage } from "@zos/storage";
import { formatDirection } from "../ui-helpers";

const logger = Logger.getLogger("page.conditions");

let waveWidget, windWidget, waterTempWidget, airTempWidget, uvWidget, sunriseSunsetWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building conditions page");
      setupGestures(1);

      setScrollMode({ mode: SCROLL_MODE_FREE });

      const root = hmUI.createWidget(hmUI.widget.VIRTUAL_CONTAINER, {
        ...CONDITIONS_PAGE_LAYOUT.root,
      });

      const row1 = hmUI.createWidget(hmUI.widget.VIRTUAL_CONTAINER, {
        parent: root,
        ...CONDITIONS_PAGE_LAYOUT.rowContainer,
      });

      const row2 = hmUI.createWidget(hmUI.widget.VIRTUAL_CONTAINER, {
        parent: root,
        ...CONDITIONS_PAGE_LAYOUT.rowContainer,
      });

      const row3 = hmUI.createWidget(hmUI.widget.VIRTUAL_CONTAINER, {
        parent: root,
        ...CONDITIONS_PAGE_LAYOUT.rowContainer,
      });

      waterTempWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WATER_TEMP,
        parent: row1,
      });

      airTempWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.AIR_TEMP,
        parent: row1,
      });

      waveWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE,
        parent: row2,
      });

      windWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WIND,
        parent: row2,
      });

      uvWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.UV,
        parent: row3,
      });

      sunriseSunsetWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.SUNRISE_SUNSET,
        parent: row3,
      });

      let cached = null;
      try {
        cached = loadForecast(localStorage);
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
      logger.debug("Rendering conditions for", data.beach);
      const c = data.current;

      waveWidget.setProperty(
        hmUI.prop.TEXT,
        `🌊\n${c.swell.height.toFixed(1)}m  ${c.swell.period}s\n${formatDirection(c.swell.direction)}`
      );

      windWidget.setProperty(
        hmUI.prop.TEXT,
        `💨\n${c.wind.speed} km/h\n${formatDirection(c.wind.direction, true)}`
      );

      waterTempWidget.setProperty(
        hmUI.prop.TEXT,
        `🌡️\n${c.waterTemp}°C`
      );

      airTempWidget.setProperty(
        hmUI.prop.TEXT,
        `🌤️\n${data.weather.temperature}°C`
      );

      uvWidget.setProperty(
        hmUI.prop.TEXT,
        `☀️\nUV ${data.weather.uvIndex}`
      );

      sunriseSunsetWidget.setProperty(
        hmUI.prop.TEXT,
        `🌅 ${data.sunrise} \n🌇 ${data.sunset}`
      );
    },

    renderNoData() {
      logger.debug("Rendering no data");
      waveWidget.setProperty(hmUI.prop.TEXT, "🌊\n-");
      windWidget.setProperty(hmUI.prop.TEXT, "💨\n-");
      waterTempWidget.setProperty(hmUI.prop.TEXT, "🌡️\n-");
      airTempWidget.setProperty(hmUI.prop.TEXT, "🌤️\n-");
      uvWidget.setProperty(hmUI.prop.TEXT, "☀️\n-");
      sunriseSunsetWidget.setProperty(hmUI.prop.TEXT, "🌅 -\n🌇 -");
    },
  })
);