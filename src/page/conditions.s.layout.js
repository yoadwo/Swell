import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import { DEVICE_WIDTH } from "../utils/config/device";

export const CONDITIONS_PAGE_LAYOUT = {
  WAVE: {
    x: px(16),
    y: px(40),
    w: px(173),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WIND: {
    x: px(203),
    y: px(40),
    w: px(173),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WATER_TEMP: {
    x: px(16),
    y: px(200),
    w: px(173),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  SUNRISE_SUNSET: {
    x: px(203),
    y: px(200),
    w: px(173),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};