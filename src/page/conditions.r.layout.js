import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import { DEFAULT_COLOR, LABEL_COLOR, VALUE_COLOR } from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const CONDITIONS_PAGE_LAYOUT = {
  TITLE: {
    x: 0,
    y: px(20),
    w: 480,
    h: px(50),
    text_size: px(36),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WAVE_HEIGHT: {
    x: px(30),
    y: px(90),
    w: px(200),
    h: px(70),
    text_size: px(48),
    color: VALUE_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WAVE_PERIOD: {
    x: px(250),
    y: px(90),
    w: px(200),
    h: px(70),
    text_size: px(48),
    color: VALUE_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WAVE_DIRECTION: {
    x: px(30),
    y: px(170),
    w: px(200),
    h: px(50),
    text_size: px(32),
    color: LABEL_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WIND_SPEED: {
    x: px(250),
    y: px(170),
    w: px(200),
    h: px(50),
    text_size: px(32),
    color: LABEL_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WIND_DIRECTION: {
    x: px(30),
    y: px(230),
    w: px(200),
    h: px(50),
    text_size: px(32),
    color: LABEL_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  WATER_TEMP: {
    x: px(250),
    y: px(230),
    w: px(200),
    h: px(50),
    text_size: px(32),
    color: LABEL_COLOR,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  SUNRISE_SUNSET: {
    x: px(30),
    y: px(300),
    w: px(420),
    h: px(60),
    text_size: px(36),
    color: VALUE_COLOR,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },
};