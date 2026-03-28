import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import {
  DEFAULT_COLOR,
  DEFAULT_COLOR_TRANSPARENT,
} from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

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

  // Icon in the gap (between beach name and score)
  ICON: {
    x: 0,
    y: px(160),
    w: 480,
    h: px(50),
    text_size: px(40),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  // Large circle for traffic light (centered) - NO COLOR (just background)
  SCORE_CIRCLE: {
    x: (480 - px(240)) / 2,
    y: (480 - px(240)) / 2 + px(30),
    r: px(120), // 240px diameter circle
    color: 0x1a1a1a, // Dark grey background, not colorful
  },

  // Score number
  SCORE_TEXT: {
    x: (480 - px(120)) / 2,
    y: (480 - px(120)) / 2 + px(30),
    w: px(120),
    h: px(120),
    text_size: px(60),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
  },

  // Message below circle
  MESSAGE_TEXT: {
    x: 0,
    y: px(380),
    w: 480,
    h: px(60),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.WRAP,
  },
};
