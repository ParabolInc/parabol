import {thresholds} from 'universal/utils/fromNow';

// For 2m20s returns 40s, for 4h15m returns 45m etc.
export default function getRefreshPeriod(time) {
  const msElapsed = (Date.now() - time) || 0;
  const threshKeys = Object.keys(thresholds);
  for (let i = 1; i < threshKeys.length; i++) {
    const thresh = thresholds[threshKeys[i]];
    if (msElapsed < thresh) {
      const largestUnit = thresholds[threshKeys[i - 1]];
      return i === 1 ? 30 * thresholds.second :
        largestUnit - msElapsed % largestUnit;
    }
  }
  throw new Error('Infinite timestamp calculated!');
}
