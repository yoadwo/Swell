import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { getTrafficLightState } from "../../utils/score";
import { loadForecast, saveForecast } from "../../utils/device-storage";
import { MAIN_PAGE_LAYOUT } from "zosLoader:./index.[pf].layout.js";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../../utils/gestures";
import { localStorage } from "@zos/storage";
import { connectStatus } from "@zos/ble";
import { showToast } from "@zos/interaction";

const logger = Logger.getLogger("page.index");

const CACHE_FRESHNESS_SECONDS = 3600;

let beachNameWidget, scoreTextWidget, messageWidget, refreshButton, statusWidget;

Page(
  BasePage({
    build() {
      logger.debug("Building index page");
      setupGestures(0);

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.TITLE,
        text: "Swell Index",
      });

      beachNameWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.BEACH_NAME,
      });

      scoreTextWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.SCORE_TEXT,
      });

      messageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.MESSAGE,
      });

      refreshButton = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.REFRESH_BUTTON,
      });
      refreshButton.addEventListener(hmUI.event.CLICK_DOWN, () => {
        logger.debug("Refresh button clicked");
        this.handleRefresh();
      });

      statusWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.STATUS,
      });

      let cached = null;
      try {
        cached = loadForecast(localStorage);
        logger.info("Forecast loaded from device storage:", cached);
      } catch (e) {
        logger.warn(`Could not use device storage due to: ${e.message}, fetching fresh data`);
      }

      if (isCacheFresh(cached)) {
        logger.info("Rendering data from for beach: %s", cached.beach);
        this.renderForecast(cached);
      } else {
        this.fetchAndRender();
      }
    },

    fetchAndRender() {
      logger.debug("Fetching and rendering forecast");

      if (!connectStatus()) {
        logger.info("Phone not connected");
        showToast({ content: "Cannot refresh data, phone is not paired" });
        return;
      }

      this.renderLoading();

      this.requestFreshData()
        .then((data) => {
          if (data) {
            try {
              logger.debug("saving forecast");
              saveForecast(localStorage, data);
            } catch (e) {
              logger.warn(`Could not save forecast: ${e.message}`);
            }
            this.renderForecast(data);
          } else {
            this.renderNoBeachSelected();
          }
        })
        .catch((err) => {
          logger.error("Failed to fetch forecast:", err.message);
          this.renderError();
        });
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
      messageWidget.setProperty(hmUI.prop.TEXT, `${state.text} ${state.icon}`);

      statusWidget.setProperty(hmUI.prop.TEXT, this.formatLastUpdated(data.updatedAt));
      refreshButton.setProperty(hmUI.prop.TEXT, MAIN_PAGE_LAYOUT.REFRESH_BUTTON.text);
    },

    handleRefresh() {
      logger.debug("Handling manual refresh");
      this.fetchAndRender();
    },

    formatLastUpdated(timestamp) {
      if (!timestamp) return "never";
      const now = Math.floor(Date.now() / 1000);
      let diff = now - timestamp;
      if (diff < 5) return "Updated just now";  // Handle clock sync issues
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    },

    renderLoading() {
      logger.debug("Rendering loading indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "Loading...");
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "");
      messageWidget.setProperty(hmUI.prop.TEXT, "");
      statusWidget.setProperty(hmUI.prop.TEXT, "");
      refreshButton.setProperty(hmUI.prop.TEXT, "");
    },

    renderNoBeachSelected() {
      logger.debug("Rendering no beach selected indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "No Beach Selected");
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "");
      messageWidget.setProperty(hmUI.prop.TEXT, "Go to Settings ⚙️");
      statusWidget.setProperty(hmUI.prop.TEXT, "");
      refreshButton.setProperty(hmUI.prop.TEXT, MAIN_PAGE_LAYOUT.REFRESH_BUTTON.text);
    },

    renderError() {
      logger.debug("Rendering error indicator");
      beachNameWidget.setProperty(hmUI.prop.TEXT, "Oh no...");
      scoreTextWidget.setProperty(hmUI.prop.COLOR, 0xFF6666);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, "");
      messageWidget.setProperty(hmUI.prop.TEXT, "Try again later! ⚠️");
      statusWidget.setProperty(hmUI.prop.TEXT, "");
      refreshButton.setProperty(hmUI.prop.TEXT, MAIN_PAGE_LAYOUT.REFRESH_BUTTON.text);
    },
  })
);

function isCacheFresh(cached) {
  if (!cached || !cached.updatedAt) return false;
  const age = Math.floor(Date.now() / 1000) - cached.updatedAt;
  return age < CACHE_FRESHNESS_SECONDS;
}