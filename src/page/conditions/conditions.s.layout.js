import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const CONDITIONS_PAGE_LAYOUT = {
  WAVE: {
    x: px(16),
    y: px(30),
    w: px(173),
    h: px(110),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WIND: {
    x: px(201),
    y: px(30),
    w: px(173),
    h: px(110),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WATER_TEMP: {
    x: px(16),
    y: px(155),
    w: px(173),
    h: px(110),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  AIR_TEMP: {
    x: px(201),
    y: px(155),
    w: px(173),
    h: px(110),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  UV: {
    x: px(16),
    y: px(280),
    w: px(173),
    h: px(35),
    text_size: px(16),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  SUNRISE_SUNSET: {
    x: px(201),
    y: px(280),
    w: px(173),
    h: px(35),
    text_size: px(16),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};