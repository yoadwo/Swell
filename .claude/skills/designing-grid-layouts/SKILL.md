---
name: designing-grid-layouts
description: This skill documents creating a grid layout system (similar to "flex" in html). Use this skill as reference when asked to create similar cell-based layouts for watch apps.
---

# Designing Grid Layouts for Zepp OS Watch Apps

## Overview

The Swell Conditions page uses a **2x3 grid** layout (2 columns, 3 rows) to display metrics in a cell-like format:
- **6 cells** arranged in 2 columns × 3 rows
- Each cell contains a single metric (wave, wind, water temp, air temp, UV, sunrise/sunset)
- Orange borders (`0xFFA500`) define each cell visually

---

## Core Files

| File | Purpose |
|------|---------|
| `page/conditions/conditions.js` | Page logic: creates `STROKE_RECT` for borders + `TEXT` widgets for data |
| `page/conditions/conditions.r.layout.js` | Layout for **round** displays (e.g., GTR, Balance) - 480×480 |
| `page/conditions/conditions.s.layout.js` | Layout for **square** displays (e.g., Band) - 390×312 |

---

## Grid Configuration Structure

The layout file exports two main exports:

### 1. GRID - Dimensions

```javascript
export const GRID = {
  COLS: 2,
  ROWS: 3,
};
```

- `COLS` - number of columns
- `ROWS` - number of rows

### 2. CELL - Dimensions and Styling

```javascript
export const CELL = {
  WIDTH: Math.floor(DEVICE_WIDTH / GRID.COLS),    // Cell width in px
  HEIGHT: Math.floor(DEVICE_HEIGHT / GRID.ROWS) + 8, // Cell height + vertical margin
  PADDING: 10,       // Internal padding inside each cell
  BORDER_WIDTH: 2,    // Border line width
  BORDER_COLOR: 0xFFA500, // Orange border
  BORDER_ALPHA: 100,  // Border opacity (0-255)
};
```

**Key formulas:**
- `CELL.WIDTH = DEVICE_WIDTH / COLS` - Each column fills half the screen width
- `CELL.HEIGHT = DEVICE_HEIGHT / ROWS` - Each row fills 1/3 of screen height
- `+8` adds overlap/gap between rows (optional adjustment)
- Always derive offsets from CELL constants (CELL.PADDING, CELL.HEIGHT, etc.) instead of hard-coded values

### 3. CONDITIONS_PAGE_LAYOUT - Text Positions

Each widget needs X and Y coordinates. The formula calculates positions based on grid cells:

```javascript
// Y positions (row-based, derived from CELL constants)
const TEXT_Y_BASE = CELL.PADDING + 20;
const TEXT_Y_ROW_0 = TEXT_Y_BASE;                          // Top row
const TEXT_Y_ROW_1 = CELL.PADDING + CELL.HEIGHT + 10;     // Middle row
const TEXT_Y_ROW_2 = CELL.PADDING + 2 * CELL.HEIGHT + 20;  // Bottom row

// X positions (column-based)
// Left column: centered in cell
x: px(CELL.PADDING + CELL.WIDTH / 2)
// Right column: offset into right cell
x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 8)
```

**Widget config example:**

```javascript
export const CONDITIONS_PAGE_LAYOUT = {
  WAVE: {
    x: px(CELL.PADDING + CELL.WIDTH / 2),
    y: px(TEXT_Y_ROW_1),      // Middle row
    text_size: px(28),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.TOP,
    text_style: hmUI.text_style.WRAP,
  },
  // ... more widgets
};
```

---

## Creating Grid Borders (conditions.js)

The page code creates `STROKE_RECT` widgets for visual borders:

```javascript
import {
  CONDITIONS_PAGE_LAYOUT,
  GRID,
  CELL
} from "zosLoader:./conditions.[pf].layout.js";

function createGridCells() {
  const { COLS, ROWS } = GRID;
  const { WIDTH, HEIGHT, BORDER_WIDTH, BORDER_COLOR, BORDER_ALPHA } = CELL;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * WIDTH;
      const y = row * HEIGHT;

      hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x,
        y,
        w: WIDTH,
        h: HEIGHT,
        radius: 0,
        line_width: BORDER_WIDTH,
        color: BORDER_COLOR,
        alpha: BORDER_ALPHA
      });
    }
  }
}
```

**Key points:**
- Loop through all grid cells
- Each STROKE_RECT positioned at `(col × WIDTH, row × HEIGHT)`
- `radius: 0` = sharp corners (set radius for rounded corners)
- `w` and `h` determine cell size

---

## Widget Positioning Formulas

### For a cell at `(col, row)`:

```javascript
// X position (column)
const x = col * CELL.WIDTH + CELL.PADDING + CELL.WIDTH / 2;
//   ^ cell start       ^ padding  ^ center in cell

// Y position (row)
const y = row * CELL.HEIGHT + CELL.PADDING + OFFSET;
//   ^ row start                 ^ padding  ^ adjust for row
```

### Left column (col = 0):
```javascript
x: px(CELL.PADDING + CELL.WIDTH / 2)
// Center of left cell
```

### Right column (col = 1):
```javascript
x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 8)
// Start of right cell ^  ^ slight offset from edge
```

### Dynamic Position Calculation (using loop indexes)

For a truly flexible grid, calculate positions dynamically using indexes instead of hard-coded row constants:

```javascript
// Calculate X/Y for a cell at (row, col)
function getCellPosition(row, col) {
  return {
    x: col * CELL.WIDTH + CELL.PADDING + CELL.WIDTH / 2,
    y: row * CELL.HEIGHT + CELL.PADDING + CELL.HEIGHT / 2,
  };
}

// Or with an offset for text inside the cell:
function getTextPosition(row, col, offsetY = 0) {
  return {
    x: px(col * CELL.WIDTH + CELL.PADDING + CELL.WIDTH / 2),
    y: px(row * CELL.HEIGHT + CELL.PADDING + 20 + offsetY),  // 20 = baseline offset
  };
}
```

This approach scales automatically when GRID or CELL values change.

---

## Adapting for Different Displays

### Round vs Square

| Property | Round (r) | Square (s) |
|----------|------------|-------------|
| `DEVICE_WIDTH` | 480 | 390 |
| `DEVICE_HEIGHT` | 480 | 312 |
| `PADDING` | 10 | 5 |
| `text_size` | 28-32 | 20-28 |

### Device Info API

```javascript
import { getDeviceInfo } from "@zos/device";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();
```

---

## Key Design Principles

1. **Use GRID object** - Define COLS/ROWS for flexibility
2. **Use CELL object** - Single source of cell dimensions
3. **Calculate positions** - Derive X/Y from grid coordinates
4. **Export separate layouts** - Round (`.r.layout.js`) vs Square (`.s.layout.js`)
5. **Reuse imports** - Import GRID/CELL in both layout and page files
6. **Call getDeviceInfo() in each layout file** - Can be used in any page-specific layout, not just the main entry
7. **Use CELL constants in formulas** - Don't hard-code offsets like `+20` or `+10`; derive from `CELL.PADDING`, `CELL.HEIGHT`, etc.
8. **Use loop indexes (i,j) in formulas** - Instead of hard-coded `TEXT_Y_ROW_0`, `TEXT_Y_ROW_1`, calculate positions dynamically from loop variables

---

## Example: Creating a 3×2 Grid

To create a different grid (e.g., 3 columns × 2 rows for a forecast page):

### Step 1: Update layout file

```javascript
export const GRID = {
  COLS: 3,
  ROWS: 2,
};

export const CELL = {
  WIDTH: Math.floor(DEVICE_WIDTH / GRID.COLS),
  HEIGHT: Math.floor(DEVICE_HEIGHT / GRID.ROWS),
  PADDING: 8,
  BORDER_WIDTH: 1,
  BORDER_COLOR: 0x00AAFF,
  BORDER_ALPHA: 80,
};
```

### Step 2: Position widgets

```javascript
const TEXT_Y_ROW_0 = CELL.PADDING + CELL.HEIGHT / 2;
const TEXT_Y_ROW_1 = CELL.PADDING + CELL.HEIGHT + CELL.HEIGHT / 2;

// Column 0
x: px(CELL.PADDING + CELL.WIDTH / 2),
// Column 1
x: px(CELL.PADDING + CELL.WIDTH + CELL.WIDTH / 2),
// Column 2
x: px(CELL.PADDING + 2 * CELL.WIDTH + CELL.WIDTH / 2),
```

---

## File Template

### layout file (e.g., `page/mypage/mypage.r.layout.js`)

```javascript
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
  HEIGHT: Math.floor(DEVICE_HEIGHT / GRID.ROWS),
  PADDING: 10,
  BORDER_WIDTH: 2,
  BORDER_COLOR: 0xFFA500,
  BORDER_ALPHA: 100,
};

const TEXT_Y_ROW_0 = CELL.PADDING + CELL.HEIGHT / 2;
const TEXT_Y_ROW_1 = CELL.PADDING + CELL.HEIGHT + CELL.HEIGHT / 2;
const TEXT_Y_ROW_2 = CELL.PADDING + 2 * CELL.HEIGHT + CELL.HEIGHT / 2;

export const MY_PAGE_LAYOUT = {
  // Left column, Row 0
  WIDGET_A: {
    x: px(CELL.PADDING + CELL.WIDTH / 2),
    y: px(TEXT_Y_ROW_0),
    text_size: px(24),
    color: 0xffffff,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
  },
  // ... more widgets
};
```

### page file (e.g., `page/mypage/mypage.js`)

```javascript
import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import {
  MY_PAGE_LAYOUT,
  GRID,
  CELL
} from "zosLoader:./mypage.[pf].layout.js";

function createGridCells() {
  const { COLS, ROWS } = GRID;
  const { WIDTH, HEIGHT, BORDER_WIDTH, BORDER_COLOR, BORDER_ALPHA } = CELL;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * WIDTH;
      const y = row * HEIGHT;

      hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x,
        y,
        w: WIDTH,
        h: HEIGHT,
        radius: 0,
        line_width: BORDER_WIDTH,
        color: BORDER_COLOR,
        alpha: BORDER_ALPHA
      });
    }
  }
}

Page(
  BasePage({
    build() {
      createGridCells();

      // Create text widgets using MY_PAGE_LAYOUT...
    },
  })
);
```

---

## Skills File Location

Skill base directory: `C:/Users/yoadw/code/amazfit/.claude/skills/designing-grid-layouts/`