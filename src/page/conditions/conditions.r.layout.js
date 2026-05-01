import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const PADDING = 10;
const ITEM_HEIGHT = Math.floor(DEVICE_HEIGHT / 3);

export const CONDITIONS_PAGE_LAYOUT = {
  root: {
    layout: {
      x: px(0),
      y: px(0),
      width: px(DEVICE_WIDTH),
      height: px(DEVICE_HEIGHT),
      display: "flex",
      "flex-flow": "column",
      "justify-content": "space-between",
      "padding-top": px(PADDING),
      "padding-left": px(PADDING),
      "padding-right": px(PADDING),
      "padding-bottom": px(PADDING),
    },
  },

  rowContainer: {
    layout: {
      width: "100%",
      height: px(ITEM_HEIGHT),
      display: "flex",
      "flex-flow": "row",
      "justify-content": "space-between",
      "align-items": "center",
    },
  },

  WAVE: {
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },

  WIND: {
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },

  WATER_TEMP: {
    text_size: px(32),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },

  AIR_TEMP: {
    text_size: px(32),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },

  UV: {
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },

  SUNRISE_SUNSET: {
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    layout: {
      width: "48%",
      height: "100%",
    },
  },
};