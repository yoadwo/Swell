import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

export const HELP_PAGE_LAYOUT = {
  TITLE: {
    x: px(0),
    y: px(20),
    w: px(480),
    h: px(40),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.BOLD,
  },

  SCORE_INTRO: {
    x: px(0),
    y: px(80),
    w: px(480),
    h: px(30),
    text_size: px(22),
    color: 0x00ff88,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
  },

  SCORE_FORMULA: {
    x: px(0),
    y: px(120),
    w: px(480),
    h: px(60),
    text_size: px(20),
    color: 0xcccccc,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  FACTOR_1: {
    x: px(20),
    y: px(180),
    w: px(440),
    h: px(110),
    text_size: px(18),
    color: 0xffffff,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  FACTOR_2: {
    x: px(20),
    y: px(300),
    w: px(440),
    h: px(110),
    text_size: px(18),
    color: 0xffffff,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  FACTOR_3: {
    x: px(20),
    y: px(420),
    w: px(440),
    h: px(80),
    text_size: px(18),
    color: 0xffffff,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  COLORS: {
    x: px(20),
    y: px(510),
    w: px(440),
    h: px(90),
    text_size: px(18),
    color: 0xcccccc,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },

  DISCLAIMER: {
    x: px(20),
    y: px(610),
    w: px(440),
    h: px(100),
    text_size: px(16),
    color: 0x888888,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.NONE,
  },
};