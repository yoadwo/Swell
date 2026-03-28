/**
 * Traffic Light Swell Index Logic
 * 
 * Score ranges (0-10):
 * - 7-10: Green (Go Crazy) - Excellent conditions
 * - 4-6: Yellow (Have Fun) - Good conditions
 * - 0-3: Red (Better Get Coffee) - Poor conditions
 */

export function getTrafficLightState(score) {
  // Clamp score to 0-10 range
  const clampedScore = Math.max(0, Math.min(10, score));

  if (clampedScore >= 7) {
    return {
      color: 0x00FF00,  // Green
      icon: '🏄',
      text: 'Go Crazy',
      description: 'Excellent conditions',
    };
  }

  if (clampedScore >= 4) {
    return {
      color: 0xFFFF00,  // Yellow
      icon: '🌊',
      text: 'Have Fun',
      description: 'Good conditions',
    };
  }

  return {
    color: 0xFF0000,   // Red
    icon: '☕',
    text: 'Better Get Coffee',
    description: 'Poor conditions',
  };
}

/**
 * Format score for display
 * @param {number} score - Raw score (0-10)
 * @returns {string} - Formatted score with decimal
 */
export function formatScore(score) {
  if (score === null || score === undefined) {
    return '-';
  }
  return score.toFixed(1);
}
