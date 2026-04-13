import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const CONDITIONS_PAGE_LAYOUT = {
  WAVE: {
    x: px(20),
    y: px(30),
    w: px(210),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WIND: {
    x: px(250),
    y: px(30),
    w: px(210),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  WATER_TEMP: {
    x: px(20),
    y: px(190),
    w: px(210),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  AIR_TEMP: {
    x: px(250),
    y: px(190),
    w: px(210),
    h: px(140),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  UV: {
    x: px(20),
    y: px(360),
    w: px(210),
    h: px(50),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  SUNRISE_SUNSET: {
    x: px(250),
    y: px(360),
    w: px(210),
    h: px(50),
    text_size: px(22),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};