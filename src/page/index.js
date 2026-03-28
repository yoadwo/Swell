import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { getTrafficLightState, formatScore } from "../utils/score";
import { MAIN_PAGE_LAYOUT } from "./index.r.layout";

// Mock score for Phase 2 UI testing
const MOCK_SCORE = 10;
const MOCK_BEACH = "Frishman Beach";

let titleWidget, beachNameWidget, iconWidget, scoreCircle, scoreTextWidget, messageWidget;

Page(
  BasePage({
    build() {
      // Title
      titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.TITLE,
        text: "Swell Index",
      });

      // Beach name
      beachNameWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.BEACH_NAME,
        text: MOCK_BEACH,
      });

      // Icon (emoji - between beach name and score)
      iconWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.ICON,
        text: "🌊", // Default emoji, will be updated
      });

      // Score circle background (just for backdrop)
      scoreCircle = hmUI.createWidget(hmUI.widget.CIRCLE, {
        ...MAIN_PAGE_LAYOUT.SCORE_CIRCLE,
      });

      // Score text (colored)
      scoreTextWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.SCORE_TEXT,
      });

      // Message text (below circle)
      messageWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...MAIN_PAGE_LAYOUT.MESSAGE_TEXT,
      });

      // Render with mock score
      this.renderUI(MOCK_SCORE);
    },

    renderUI(score) {
      const state = getTrafficLightState(score);

      scoreTextWidget.setProperty(hmUI.prop.COLOR, state.color);
      scoreTextWidget.setProperty(hmUI.prop.TEXT, formatScore(score));
      
      // Update icon and message
      iconWidget.setProperty(hmUI.prop.TEXT, state.icon);
      messageWidget.setProperty(hmUI.prop.TEXT, state.text);
    },
  })
);
