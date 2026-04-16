/**
 * UI Helpers - Pure functions for formatting display data.
 * Testable in Node.js without the watch simulator.
 */

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const ARROWS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

export function formatDirection(direction, isWind = false) {
  if (direction === null || direction === undefined) {
    return "-";
  }
  const adjustedDir = isWind ? (direction + 180) % 360 : direction;
  const idx = Math.round(adjustedDir / 45) % 8;
  return `${DIRECTIONS[idx]}(${ARROWS[idx]})`;
}