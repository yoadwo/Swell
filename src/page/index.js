import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { getTrafficLightState } from "../utils/score";
import { loadForecast, saveForecast } from "../utils/device-storage";
import { MAIN_PAGE_LAYOUT } from "./index.r.layout";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../utils/gestures";

const logger = Logger.getLogger("page.index");

const CACHE_FRESHNESS_SECONDS = 3600;

let titleWidget, beachNameWidget, iconWidget, scoreCircle, scoreTextWidget, messageWidget, staleWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building index page");
      setupGestures(0);
      titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.TITLE,
        text: "Swell Index",
      });

      beachNameWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.BEACH_NAME,
      });

      iconWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.ICON,
        text: "🌊",
      });

      scoreCircle = hmUI.createWidget(hmUI.widget.CIRCLE, {
        ...MAIN_PAGE_LAYOUT.SCORE_CIRCLE,
      });

      scoreTextWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.SCORE_TEXT,
      });

      messageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.MESSAGE_TEXT,
      });

      staleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: 440,
        w: 480,
        h: 30,
        text_size: 18,
        color: 0x888888,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
      });

      let cached = null;
      try {
        cached = loadForecast();
        logger.info("Forecast loaded from device storage:", cached);
      } catch (e) {
        logger.warn(`Could not use device storage due to: ${e.message}, fetching fresh data`);
      }

      if (isCacheFresh(cached)) {
        logger.info("Rendering data from for beach: %s", cached.beach);
        this.renderForecast(cached);
      } else {
        logger.info("Cache missing or stale, fetching new data");
        this.renderLoading();
        this.requestFreshData()
          .then((data) => {
            if (data) {
              try {
                logger.debug("saving forecast");
                saveForecast(data);
              } catch (e) {
                logger.warn(`Could not save forecast: ${e.message}`);
              }
              this.renderForecast(data);
            } else {
              this.renderNoBeachSelected();
            }
          })
          .catch((err) => {
            logger.error("Failed to fetch forecast:", err);
            this.renderError();
          });
      }
    },

    requestFreshData() {
      logger.debug("Requesting fresh data");
      return this.request({ method: "GET_FORECAST" })
        .then((data) => {
          if (data) {
            if (data.error) {
              logger.error("API error:", data.error);
              throw new Error(data.error);
            }
            logger.info("Received fresh forecast for:", data.beach);
            return data;
          } else {
            logger.info("No beach selected in settings");
            return null;
          }
        });
    },

    renderForecast(data) {
      logger.debug("Rendering forecast");
      beachNameWidget.setProperty(hmUI.prop.TEXT, data.beach);
      const state = getTrafficLightState(data.score);
      scoreTextWidget.setProperty(hmUI.prop.COLOR, state.color);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, `${data.score.toFixed(0)}/10`);
      iconWidget.setProperty(hmUI.prop.TEXT, state.icon);
      messageWidget.setProperty(hmUI.prop.TEXT, state.text);
      scoreCircle.setProperty(hmUI.prop.COLOR, 0x1a1a1a);
      staleWidget.setProperty(hmUI.prop.TEXT, "");
    },

    renderLoading() {
      logger.debug("Rendering loading indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "Loading...");
      scoreTextWidget.setProperty(hmUI.prop.COLOR, 0x888888);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "...");
      iconWidget.setProperty(hmUI.prop.TEXT, "🌊");
      messageWidget.setProperty(hmUI.prop.TEXT, "");
      scoreCircle.setProperty(hmUI.prop.COLOR, 0x1a1a1a);
      staleWidget.setProperty(hmUI.prop.TEXT, "");
    },

    renderNoBeachSelected() {
      logger.debug("Rendering no beach selected indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "No Beach Selected");
      scoreTextWidget.setProperty(hmUI.prop.COLOR, 0x888888);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "-");
      iconWidget.setProperty(hmUI.prop.TEXT, "⚙️");
      messageWidget.setProperty(hmUI.prop.TEXT, "Go to Settings");
      scoreCircle.setProperty(hmUI.prop.COLOR, 0x333333);
      staleWidget.setProperty(hmUI.prop.TEXT, "Select a beach");
    },

    renderError() {
      logger.debug("Rendering error indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "Oh no...");
      scoreTextWidget.setProperty(hmUI.prop.COLOR, 0xFF6666);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "");
      iconWidget.setProperty(hmUI.prop.TEXT, "⚠️");
      messageWidget.setProperty(hmUI.prop.TEXT, "Try again later!");
      scoreCircle.setProperty(hmUI.prop.COLOR, 0x333333);
      staleWidget.setProperty(hmUI.prop.TEXT, "");
    },

    renderServiceError(errorMessage) {
      logger.debug("Rendering service error:", errorMessage);
      beachNameWidget.setProperty(hmUI.prop.TEXT, "Service Error");
      scoreTextWidget.setProperty(hmUI.prop.COLOR, 0xFFAA00);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "");
      iconWidget.setProperty(hmUI.prop.TEXT, "🌧️");
      messageWidget.setProperty(hmUI.prop.TEXT, "Try again later!");
      scoreCircle.setProperty(hmUI.prop.COLOR, 0x333333);
      staleWidget.setProperty(hmUI.prop.TEXT, errorMessage);
    },
  })
);

function isCacheFresh(cached) {
  if (!cached || !cached.updatedAt) return false;
  const age = Math.floor(Date.now() / 1000) - cached.updatedAt;
  return age < CACHE_FRESHNESS_SECONDS;
}