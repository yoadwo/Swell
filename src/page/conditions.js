import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../utils/device-storage";
import { CONDITIONS_PAGE_LAYOUT } from "./conditions.r.layout";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../utils/gestures";

const logger = Logger.getLogger("page.conditions");

let titleWidget, waveHeightWidget, wavePeriodWidget, waveDirectionWidget;
let windSpeedWidget, windDirectionWidget, waterTempWidget, sunriseSunsetWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building conditions page");
      setupGestures(1);

      titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.TITLE,
        text: "Conditions",
      });

      waveHeightWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE_HEIGHT,
      });

      wavePeriodWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE_PERIOD,
      });

      waveDirectionWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WAVE_DIRECTION,
      });

      windSpeedWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WIND_SPEED,
      });

      windDirectionWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...CONDITIONS_PAGE_LAYOUT.WIND_DIRECTION,
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
      const current = data.current;

      waveHeightWidget.setProperty(
        hmUI.prop.TEXT,
        `${current.swell.height.toFixed(1)}m`
      );

      wavePeriodWidget.setProperty(
        hmUI.prop.TEXT,
        `${current.swell.period}s`
      );

      waveDirectionWidget.setProperty(
        hmUI.prop.TEXT,
        formatDirection(current.swell.direction)
      );

      windSpeedWidget.setProperty(
        hmUI.prop.TEXT,
        `${current.wind.speed} km/h`
      );

      windDirectionWidget.setProperty(
        hmUI.prop.TEXT,
        formatDirection(current.wind.direction, true)
      );

      waterTempWidget.setProperty(
        hmUI.prop.TEXT,
        `${current.waterTemp}°C`
      );

      sunriseSunsetWidget.setProperty(
        hmUI.prop.TEXT,
        `${data.sunrise} - ${data.sunset}`
      );
    },

    renderNoData() {
      logger.debug("Rendering no data");
      waveHeightWidget.setProperty(hmUI.prop.TEXT, "-");
      wavePeriodWidget.setProperty(hmUI.prop.TEXT, "-");
      waveDirectionWidget.setProperty(hmUI.prop.TEXT, "-");
      windSpeedWidget.setProperty(hmUI.prop.TEXT, "-");
      windDirectionWidget.setProperty(hmUI.prop.TEXT, "-");
      waterTempWidget.setProperty(hmUI.prop.TEXT, "-");
      sunriseSunsetWidget.setProperty(hmUI.prop.TEXT, "-");
    },
  })
);

function formatDirection(direction, cardinal = false) {
  if (direction === null || direction === undefined) {
    return "-";
  }

  if (cardinal) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(direction / 45) % 8;
    return directions[index];
  }

  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const index = Math.round(direction / 45) % 8;
  return `${arrows[index]} ${Math.round(direction)}°`;
}