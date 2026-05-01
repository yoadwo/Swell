import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const GRID = {
  COLS: 2,
  ROWS: 3,
};

export const CELL = {
  WIDTH: Math.floor(DEVICE_WIDTH / GRID.COLS),
  HEIGHT: Math.floor(DEVICE_HEIGHT / GRID.ROWS) + 8,
  PADDING: 5,
  BORDER_WIDTH: 2,
  BORDER_COLOR: 0xFFA500,
  BORDER_ALPHA: 100,
};

const TEXT_Y_BASE = CELL.PADDING + 15;
const TEXT_Y_ROW_0 = TEXT_Y_BASE;
const TEXT_Y_ROW_1 = CELL.PADDING + CELL.HEIGHT + 10;
const TEXT_Y_ROW_2 = CELL.PADDING + 2 * CELL.HEIGHT + 15;

export const CONDITIONS_PAGE_LAYOUT = {
  // Left column: x at center of cell
  WAVE: {
    x: px(CELL.PADDING + CELL.WIDTH / 2),
    y: px(TEXT_Y_ROW_1),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },

  // Right column: x at 1/8 from left edge of right cell
  WIND: {
    x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 8),
    y: px(TEXT_Y_ROW_1),
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },

  WATER_TEMP: {
    x: px(CELL.PADDING + CELL.WIDTH / 2),
    y: px(TEXT_Y_ROW_0),
    text_size: px(26),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },

  AIR_TEMP: {
    x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 8),
    y: px(TEXT_Y_ROW_0),
    text_size: px(26),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },

  UV: {
    x: px(CELL.PADDING + CELL.WIDTH / 2),
    y: px(TEXT_Y_ROW_2),
    text_size: px(20),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },

  SUNRISE_SUNSET: {
    x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 8),
    y: px(TEXT_Y_ROW_2),
    text_size: px(20),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },
};
};