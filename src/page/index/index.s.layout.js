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

  ICON_MESSAGE: {
    x: 0,
    y: px(240),
    w: SQUARE_WIDTH,
    h: px(50),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.WRAP,
  },

  STALE: {
    x: 0,
    y: px(360),
    w: SQUARE_WIDTH,
    h: px(30),
    text_size: px(18),
    color: 0x888888,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },
};