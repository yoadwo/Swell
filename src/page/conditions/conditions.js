import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../../utils/device-storage";
import {
  CONDITIONS_PAGE_LAYOUT,
  GRID,
  CELL
} from "zosLoader:./conditions.[pf].layout.js";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../../utils/gestures";
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";
import { localStorage } from "@zos/storage";
import { formatDirection } from "../ui-helpers";

const logger = Logger.getLogger("page.conditions");

function createGridCells() {
  const { COLS, ROWS } = GRID;
  const { WIDTH, HEIGHT, BORDER_WIDTH, BORDER_COLOR, BORDER_ALPHA } = CELL;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * WIDTH;
      const y = row * HEIGHT;

      hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x,
        y,
        w: WIDTH,
        h: HEIGHT,
        radius: 0,
        line_width: BORDER_WIDTH,
        color: BORDER_COLOR,
        alpha: BORDER_ALPHA
      });
    }
  }
}

let waveWidget, windWidget, waterTempWidget, airTempWidget, uvWidget, sunriseSunsetWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building conditions page");
      setupGestures(1);

      setScrollMode({ mode: SCROLL_MODE_FREE });

      createGridCells();

      waveWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE,
      });

      windWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WIND,
      });

      waterTempWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WATER_TEMP,
      });

      airTempWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.AIR_TEMP,
      });

      uvWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.UV,
      });

      sunriseSunsetWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.SUNRISE_SUNSET,
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
        `🌊\n${c.swell.height.toFixed(1)}m  ${c.swell.period}s ${formatDirection(c.swell.direction)}`
      );

      windWidget.setProperty(
        hmUI.prop.TEXT,
        `💨\n${c.wind.speed} km/h ${formatDirection(c.wind.direction, true)}`
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