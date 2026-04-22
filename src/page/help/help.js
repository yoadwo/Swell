import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { HELP_PAGE_LAYOUT } from "./help.r.layout";
import { log as Logger } from "@zos/utils";
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";
import { setupGestures } from "../../utils/gestures";

const logger = Logger.getLogger("page.help");

Page(
  BasePage({
    build() {
      logger.debug("Building help page");

      setupGestures(3);

      setScrollMode({
        mode: SCROLL_MODE_FREE,
        options: {
          modeParams: {
            bounce: true,
          },
        },
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.TITLE,
        text: "How It Works",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.SCORE_INTRO,
        text: "Swell Index Score",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.SCORE_FORMULA,
        text: "Score = Avg(Factors) x 3.33\nRange: 0-10",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.FACTOR_1,
        text: "1. Swell Height\n0.9m-1.3m -> 3pts\n0.7m-0.9m,1.3m-1.5m -> 2pts\n<0.7m,>1.5m -> 1pt\nFlat -> 0pts",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.FACTOR_2,
        text: "2. Swell Period\n10s+ -> 3pts\n8s-10s -> 2pts\n5s-8s -> 1pt\n<5s -> 0pts",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.FACTOR_3,
        text: "3. Wind Impact\nDir: offshore->3, side->2, side-on->1\nChop: <=0.5m->3, <=0.8m->2, >0.8m->1\n(2xDir+Chop)/3",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.COLORS,
        text: "Colors:\n🟢 7-10 Green\n🟡 4-6 Yellow\n🔴 0-3 Red",
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        ...HELP_PAGE_LAYOUT.DISCLAIMER,
        text: "Disclaimer:\nScores are suggestions.\nAlways check conditions\nyourself and surf at\nyour own risk.",
      });
    },
  })
);