import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

// Main Page Layout - Traffic Light Swell Index (Round 480x480)
export const MAIN_PAGE_LAYOUT = {
  TITLE: {
    x: 0,
    y: px(40),
    w: 480,
    h: px(60),
    text_size: px(40),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  BEACH_NAME: {
    x: 0,
    y: px(110),
    w: 480,
    h: px(40),
    text_size: px(24),
    color: 0xcccccc,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  SCORE_TEXT: {
    x: 0,
    y: px(180),
    w: 480,
    h: px(100),
    text_size: px(80),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  ICON_MESSAGE: {
    x: 0,
    y: px(300),
    w: 480,
    h: px(60),
    text_size: px(32),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.WRAP,
  },

  STALE: {
    x: 0,
    y: px(440),
    w: 480,
    h: px(30),
    text_size: px(18),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },
};
