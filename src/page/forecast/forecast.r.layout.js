import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const FORECAST_PAGE_LAYOUT = {
  ROW_DAY: {
    x: px(100),
    w: px(380),
    h: px(30),
    text_size: px(24),
    color: 0xffffff,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.BOLD,
  },

  ROW_WAVE: {
    x: px(100),
    w: px(200),
    h: px(30),
    text_size: px(18),
    color: 0xcccccc,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  ROW_PERIOD: {
    x: px(250),
    w: px(180),
    h: px(30),
    text_size: px(18),
    color: 0xcccccc,
    align_h: hmUI.align.RIGHT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  ROW_WIND: {
    x: px(100),
    w: px(200),
    h: px(30),
    text_size: px(16),
    color: 0x888888,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  ROW_SCORE: {
    x: px(225),
    w: px(190),
    h: px(30),
    text_size: px(22),
    align_h: hmUI.align.RIGHT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.BOLD,
  },

  NO_DATA: {
    x: px(0),
    y: px(200),
    w: px(480),
    h: px(80),
    text_size: px(28),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  NAV: {
    x: px(0),
    y: px(420),
    w: px(480),
    h: px(40),
    text_size: px(20),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};