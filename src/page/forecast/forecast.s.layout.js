import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const FORECAST_PAGE_LAYOUT = {
  DAY: {
    x: px(0),
    y: px(20),
    w: px(390),
    h: px(50),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WAVE: {
    x: px(0),
    y: px(75),
    w: px(390),
    h: px(40),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  PERIOD: {
    x: px(0),
    y: px(120),
    w: px(390),
    h: px(40),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WIND: {
    x: px(0),
    y: px(165),
    w: px(390),
    h: px(40),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  SCORE: {
    x: px(0),
    y: px(220),
    w: px(390),
    h: px(50),
    text_size: px(26),
    color: 0x00ff00,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.BOLD,
  },

  NAV: {
    x: px(0),
    y: px(340),
    w: px(390),
    h: px(30),
    text_size: px(16),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};