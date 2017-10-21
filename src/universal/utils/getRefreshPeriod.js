import {thresholds} from 'universal/utils/fromNow';
import {MAX_INT} from 'universal/utils/constants';

// For 2m20s returns 40s, for 4h15m returns 45m etc.
export default function getRefreshPeriod(time) {
  const msElapsed = (Date.now() - time) || 0;
  const threshKeys = Object.keys(thresholds);
  for (let i = 1; i < threshKeys.length; i++) {
    const thresh = thresholds[threshKeys[i]];
    if (msElapsed < thresh) {
      const largestUnit = thresholds[threshKeys[i - 1]];
      const minimum = 30 * thresholds.second;
      const minVal = Math.max(largestUnit - msElapsed % largestUnit, minimum);
      return Math.min(minVal, MAX_INT);
    }
  }
  throw new Error('Infinite timestamp calculated!');
}
