import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import { DEVICE_WIDTH } from "../../utils/config/device";

const SQUARE_WIDTH = DEVICE_WIDTH;

export const MAIN_PAGE_LAYOUT = {
  TITLE: {
    x: 0,
    y: px(20),
    w: SQUARE_WIDTH,
    h: px(50),
    text_size: px(36),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  BEACH_NAME: {
    x: 0,
    y: px(80),
    w: SQUARE_WIDTH,
    h: px(40),
    text_size: px(24),
    color: 0xcccccc,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  SCORE_TEXT: {
    x: 0,
    y: px(140),
    w: SQUARE_WIDTH,
    h: px(80),
    text_size: px(64),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  MESSAGE: {
    x: 0,
    y: px(215),
    w: SQUARE_WIDTH,
    h: px(50),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.WRAP,
  },

  REFRESH_BUTTON: {
    x: 0,
    y: px(285),
    w: SQUARE_WIDTH,
    h: px(20),
    text: "Refresh",
    text_size: px(16),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
  },

  STATUS: {
    x: 0,
    y: px(260),
    w: SQUARE_WIDTH,
    h: px(18),
    text_size: px(12),
    color: 0x00aaff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },
};