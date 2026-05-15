---
name: zepp-os-app-create
description: Scaffolds and develops Zepp OS apps for Amazfit watches. Use when building Zepp OS mini programs, watch apps, or when the user mentions Amazfit, Zepp OS, or Zeus CLI.
---

# Zepp OS App Development

## Quick Reference

- **CLI**: Zeus (`zeus` on PATH)
- **Docs**: https://docs.zepp.com/
- **Context7 library ID**: `/zepp-health/zeppos-docs`

## Creating a Project

**Do not run `zeus create` via agents.** The command is interactive and awaits user input. Instead, instruct the user to run it manually in their terminal:

```
zeus create <project-name>
```

Typical choices: APP → API 4.0 → template (e.g. "Hello world").

## Project Structure (Hello World pattern)

| Path | Purpose |
|------|---------|
| `app.js` | App entry – `onCreate`, `onDestroy` |
| `app.json` | Config – appId, targets, API version, design width |
| `page/<target>/<page>/` | Device-specific pages (e.g. `page/gt/home/`) |
| `index.page.js` | Page logic – `onInit`, `build`, `onDestroy` |
| `index.page.[pf].layout.js` | Layout styles; `[pf]` = `r` (round) or `s` (square) |
| `utils/` | Shared helpers |

Layout files export styles (e.g. `TEXT_STYLE`). The page `build()` creates widgets with `hmUI.createWidget(hmUI.widget.TEXT, TEXT_STYLE)`.

## Updating UI

- Edit layout files (`index.page.r.layout.js`, `index.page.s.layout.js`).
- Text content: `text: "literal"` or `text: getText("i18nKey")`.
- Use `@zos/device` (`getDeviceInfo`), `@zos/utils` (`px`), `@zos/ui` (`hmUI`) for layout.

## Preview & Build

- **Simulator**: User runs `zeus dev` manually (launch Zepp Simulator first, enable Device Simulator).
- **Real device**: `zeus preview` (generates QR code for Zepp App).
- **Build**: `zeus build` → output in `dist/`.

## External Libraries (npm)

- Install: `npm i <package> --save`
- **Compatibility**: Some npm packages use Node/browser APIs (`require`, `module.exports`, `fs`, DOM) and may not run on Zepp OS.
- **When to act**: Only if the user reports build or runtime errors with a package. Then suggest scanning for incompatible APIs or finding a Zepp-compatible alternative. Do not proactively extract logic from packages.

## Troubleshooting: Simulator & Side Service

If Side Service bridge is not responding, the correct startup order is:

1. **Open Zepp Simulator** (on computer)
2. **Enable Device Simulator** in Simulator settings
3. **Run Zeus dev** in project folder: `cd Swell/src && zeus dev`
4. Wait for "Device Simulator: Connected" message
5. Install app in Simulator
6. **On phone**: Open Zepp App → Find Swell → Manually start Side Service (not just open watch app)

**If bridge is stuck/not running:**
1. Close Zepp Simulator completely
2. Close Zepp App on phone
3. Reopen Simulator → Enable settings → Enable Device Simulator
4. Run `zeus dev`

## Knowledge Base Shortcuts
Simplify complicated design and implementation issues

### Page Scroll Modes

Reference: https://docs.zepp.com/docs/reference/device-app-api/newAPI/page/setScrollMode/

#### SCROLL_MODE_FREE (Free Scroll)

Use for continuous content that scrolls smoothly and stays where you leave it.

```javascript
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";

setScrollMode({ mode: SCROLL_MODE_FREE });
```

- All content renders at once
- Swipe up/down to scroll through content
- Best for: Long lists, data tables, forecast pages

##### Disable Bounce/Snap-Back

By default, SCROLL_MODE_FREE has a "bounce" effect when you reach the end of content. To disable:

```javascript
import { setScrollMode, SCROLL_MODE_FREE } from "@zos/page";

setScrollMode({
  mode: SCROLL_MODE_FREE,
  options: {
    modeParams: {
      bounce: false,
    },
  },
});
```

- `bounce: false` - Scroll stays where you leave it (no snap-back)
- `bounce: true` (default) - Content snaps back when released

#### SCROLL_MODE_SWIPER (Paged Scroll)

Use when content is divided into discrete "screens" that fill the display.

```javascript
import { setScrollMode, SCROLL_MODE_SWIPER } from "@zos/page";

setScrollMode({
  mode: SCROLL_MODE_SWIPER,
  options: {
    height: 480,  // Height of each "screen"
    count: 4,       // Total number of screens
  },
});
```

- Each item is exactly one screen height
- Swipe snaps to next/previous screen
- Best for: Slideshows, step-by-step wizards

#### Horizontal Scrolling

Reference: https://docs.zepp.com/docs/designs/elements/page-indicators/

For horizontal swipe between full-screen pages:

```javascript
import { setScrollMode, SCROLL_MODE_SWIPER_HORIZONTAL } from "@zos/page";

setScrollMode({
  mode: SCROLL_MODE_SWIPER_HORIZONTAL,
  options: {
    width: 480,
    count: 3,
  },
});
```

### Gesture Setup

Use `onGesture` from `@zos/interaction` to handle swipe events to turn pages.
Swipe on the right-most ("last") page does nothing.

```javascript
import { replace } from "@zos/router";
import { onGesture, GESTURE_LEFT, GESTURE_RIGHT } from "@zos/interaction";

const PAGE_URLS = ["page/one", "page/two"];

export function setupGestures(currentPageIndex) {
  const totalPages = PAGE_URLS.length;
  const isFirst = currentPageIndex === 0;
  const isLast = currentPageIndex === totalPages - 1;

  onGesture({
    callback: (event) => {
      if (event === GESTURE_LEFT && !isLast) {
        replace({ url: PAGE_URLS[currentPageIndex + 1] });
        return true;
      }
      if (event === GESTURE_RIGHT && !isFirst) {
        replace({ url: PAGE_URLS[currentPageIndex - 1] });
        return true;
      }
      return false;
    },
  });
}
```

**Usage**: Call `setupGestures(pageIndex)` in page's `build()` - index is 0-based position in `PAGE_URLS`.

**Available constants**:
- `GESTURE_LEFT` - swipe left
- `GESTURE_RIGHT` - swipe right
- `GESTURE_UP` - swipe up
- `GESTURE_DOWN` - swipe down

### UI Reload/Refresh
There is no single method to force refresh of the UI in the Pages files or in the settings app.
Don't bother calling "reload()", "load()", "refresh()" or any similar methods. This will result in a runtime error for method not found.
Instead:
- For Device App (Page files), either manually set the widgets, or manipulate the state object:
  ```
  Page({
    state: {
      text: 'Hello Zepp OS'
    }
    [...]
  })
  ```
- For the Settings App, manipulate the setting storage, as said in the official docs: `Manipulate SettingsStorage in the registration event callback function to re-execute the build lifecycle function to trigger the UI update`
  ```
  onClick: () => {
    // 5. Modify the data in settingsStorage in the callback function of the event
    props.settingsStorage.setItem('testKey', toggleButtonMap[this.state.testKey])
  }
  ```