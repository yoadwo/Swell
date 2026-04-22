/**
 * Swell Index Score Calculation and Display
 * 
 */

/**
 * Calculate Swell Index score from forecast conditions
 * Combines swell height and period with wind direction and chop into a 0-10 composite score.
 * See PRD 6 FR-6 for detailed scoring algorithm and thresholds.
 * 
 * NOTE: Wind speed is available in forecastData.current.wind.speed but is NOT used in scoring.
 * Instead, wind wave height (chop) is used as the professional wind impact measure.
 * Wind speed is stored for reference/display on other pages and benchmarking purposes.
 * 
 * @param {Object} forecastData - Raw forecast {current: {swell: {height, period, direction}, wind: {height, direction, speed}}}
 * @returns {number} - Score 0-10
 */
export function calculateScore(forecastData) {
  if (!forecastData || !forecastData.current) {
    throw new Error('Invalid forecast data');
  }

  const { swell, wind } = forecastData.current;
  if (!swell || !wind) {
    throw new Error('Invalid forecast data: missing swell or wind');
  }

  const { height: swellHeight, period: swellPeriod, direction: swellDirection } = swell;
  const { height: windWaveHeight, direction: windDirection } = wind;

  // Step 1: Calculate wind direction favorability score (0-3)
  // Uses sea direction to determine offshore/onshore
  // For Israel: all beaches face west, so hardcoded 270 ('west')
  const windDirectionScore = getWindScore(windDirection, 270);

  // Wind chop reduction score (based on wind wave height in meters)
  let windChopScore = 0;
  if (windWaveHeight <= 0.5) {
    windChopScore = 3; // Great (minimal chop)
  } else if (windWaveHeight <= 0.8) {
    windChopScore = 2; // OK (moderate chop)
  } else {
    windChopScore = 1; // Low (heavy chop)
  }
  // Combine wind direction favorability with chop effect
  // Direction (offshore/onshore) is critical, chop is secondary
  const windImpactScore = (windDirectionScore * 2 + windChopScore) / 3;

  // Step 2: Calculate component scores (each 0-3, then normalize to 0-10)
  let swellHeightScore = 0;
  let swellPeriodScore = 0;

  // Swell height (meters)
  if (swellHeight >= 0.9 && swellHeight <= 1.3) {
    swellHeightScore = 3; // Great (90cm-130cm)
  } else if ((swellHeight >= 0.7 && swellHeight < 0.9) || (swellHeight > 1.3 && swellHeight <= 1.5)) {
    swellHeightScore = 2; // Good (a bit too low 70cm-90cm or a bit too high 130cm-150cm)
  } else if ((swellHeight < 0.7 || swellHeight > 1.5 )) {
    swellHeightScore = 1;
  }

  // Swell period (seconds)
  if (swellPeriod >= 10) {
    swellPeriodScore = 3; // Great (10s+)
  } else if (swellPeriod >= 8) {
    swellPeriodScore = 2; // Good (8-10s)
  } else if (swellPeriod >= 5) {
    swellPeriodScore = 1; // Low (7s)
  } else {
    swellPeriodScore = 0; // Very low (<7s)
  }

  // Aggregate: Average the three factors (each 0-3) and scale to 0-10
  // See PRD § 6 FR-6 for scoring formula
  const avgScore = (windImpactScore + swellHeightScore + swellPeriodScore) / 3;
  const finalScore = Math.round(avgScore * (10 / 3) * 10) / 10;

  return Math.max(0, Math.min(10, finalScore));
}

/**
 * Calculate wind score based on direction relative to sea direction
 * Wind coming from the land to the sea = offshore (favorable)
 * Wind coming from the sea to the land = onshore (unfavorable)
 *
 * Algorithm:
 * 1. Calculate offshore direction (seaDirection + 180°)
 * 2. Calculate angular difference between wind and offshore direction
 * 3. Map difference to score based on offshore alignment
 *
 * Future consideration: Sea direction varies by location
 * When expanding beyond Israel, store seaDirection in beach metadata and pass dynamically.
 * For Israel: All beaches face west (270°), so hardcoded to 270 for now.
 * 
 * @param {number} windDirection - Direction in degrees (0-360, where 0/360=N, 90=E, 180=S, 270=W)
 * @param {number} seaDirection - Direction ocean faces in degrees. Default 270° (West) for Israel
 * @returns {number} - Wind score 0-3
 */
export function getWindScore(windDirection, seaDirection = 270) {
  if (windDirection === undefined || windDirection === null) {
    throw new Error('Wind direction is required');
  }

  if (typeof windDirection !== 'number' || typeof seaDirection !== 'number'
    || windDirection > 360 || seaDirection > 360
  ) {
    throw new Error('Invalid wind or sea direction');
  }

  // Calculate offshore direction (opposite of sea direction)
  const offshoreDirection = (seaDirection + 180) % 360;

  // Calculate angular difference between wind and offshore direction
  // We want winds within ±45° of offshore direction to be favorable
  let diff = Math.abs(windDirection - offshoreDirection);

  // Handle wrap-around (e.g., difference between 350° and 10° is 20°, not 340°)
  if (diff > 180) {
    diff = 360 - diff;
  }

  // Score based on how well wind aligns with offshore direction
  if (diff <= 45) {
    return 3; // Great (optimal offshore: within 45° of offshore direction)
  } else if (diff <= 90) {
    return 2; // Good (somewhat offshore or side wind)
  } else if (diff <= 135) {
    return 1; // Acceptable (side wind)
  } else {
    return 0; // Poor (onshore - wind coming from sea direction)
  }
}

/**
 * Get traffic light state based on score
 * Score ranges (0-10):
 * - 7-10: Green (Go Crazy) - Excellent conditions
 * - 4-6: Yellow (Have Fun) - Good conditions
 * - 0-3: Red (Better Get Coffee) - Poor conditions
 * 
 * @param {number} score - Raw score (0-10)
 * @returns {Object} - {color, icon, text, description}
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


