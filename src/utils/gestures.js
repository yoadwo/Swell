import { replace } from "@zos/router";
import { onGesture, GESTURE_LEFT, GESTURE_RIGHT } from "@zos/interaction";

const PAGE_URLS = ["page/index", "page/conditions"];

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