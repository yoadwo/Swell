import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { loadForecast } from "../../utils/device-storage";
import { FORECAST_PAGE_LAYOUT } from "./forecast.r.layout";
import { log as Logger } from "@zos/utils";
import { setupGestures } from "../../utils/gestures";
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";
import { onGesture, GESTURE_LEFT, GESTURE_RIGHT } from "@zos/interaction";
import { localStorage } from "@zos/storage";
import { formatDirection } from "../ui-helpers";

const logger = Logger.getLogger("page.forecast");

const COLORS = {
  GREEN: 0x00ff00,
  YELLOW: 0xffff00,
  RED: 0xff0000,
};

function getScoreColor(score) {
  if (score >= 7) return COLORS.GREEN;
  if (score >= 4) return COLORS.YELLOW;
  return COLORS.RED;
}

Page(
  BasePage({
    build() {
      logger.debug("Building forecast page");
      setupGestures(2, { skipPageNav: true });

      setScrollMode({ mode: SCROLL_MODE_FREE });

      this.dayWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.DAY,
      });

      this.waveWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.WAVE,
      });

      this.periodWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.PERIOD,
      });

      this.windWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.WIND,
      });

      this.scoreWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.SCORE,
      });

      this.navWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FORECAST_PAGE_LAYOUT.NAV,
      });

      let cached = null;
      try {
        cached = loadForecast(localStorage);
        logger.info("Loaded forecast from device storage:", cached.beach);
      } catch (e) {
        logger.warn(`Could not load forecast: ${e.message}`);
      }

      if (cached && cached.forecast && cached.forecast.length > 0) {
        this.currentIndex = 0;
        this.days = cached.forecast;
        this.renderDay(0);
      } else {
        this.renderNoData();
        this.days = [];
      }

      onGesture({
        callback: (event) => {
          if (!this.days || this.days.length === 0) return false;
          if (event === GESTURE_LEFT) {
            this.currentIndex = (this.currentIndex + 1) % this.days.length;
            this.renderDay(this.currentIndex);
            return true;
          }
          if (event === GESTURE_RIGHT) {
            this.currentIndex = (this.currentIndex - 1 + this.days.length) % this.days.length;
            this.renderDay(this.currentIndex);
            return true;
          }
          return false;
        },
      });
    },

    renderDay(index) {
      if (index < 0 || index >= this.days.length) return;
      const day = this.days[index];
      const color = getScoreColor(day.score);

      this.dayWidget.setProperty(hmUI.prop.TEXT, day.day);
      this.waveWidget.setProperty(
        hmUI.prop.TEXT,
        `🌊 ${day.waveHeightMin.toFixed(1)}–${day.waveHeightMax.toFixed(1)}m`
      );
      this.periodWidget.setProperty(hmUI.prop.TEXT, `⏱️ ${day.period}s`);
      this.windWidget.setProperty(
        hmUI.prop.TEXT,
        `💨 ${day.windSpeed} km/h ${formatDirection(day.windDirection, true)}`
      );
      this.scoreWidget.setProperty(hmUI.prop.TEXT, `Score: ${day.score}`);
      this.scoreWidget.setProperty(hmUI.prop.COLOR, color);

      const navText = `${index + 1}/${this.days.length}  ← →`;
      this.navWidget.setProperty(hmUI.prop.TEXT, navText);
    },

    renderNoData() {
      this.dayWidget.setProperty(hmUI.prop.TEXT, "—");
      this.waveWidget.setProperty(hmUI.prop.TEXT, "🌊 —");
      this.periodWidget.setProperty(hmUI.prop.TEXT, "⏱️ —");
      this.windWidget.setProperty(hmUI.prop.TEXT, "💨 —");
      this.scoreWidget.setProperty(hmUI.prop.TEXT, "Score: —");
      this.scoreWidget.setProperty(hmUI.prop.COLOR, 0xffffff);
      this.navWidget.setProperty(hmUI.prop.TEXT, "No forecast");
    },
  })
);