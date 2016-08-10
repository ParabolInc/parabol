const thresholds = {
  second: 1000,
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2592000000,
  year: 31536000000,
  inf: Infinity
};

export default function fromNow(time) {
  const distance = (Date.now() - time) || 0;
  if (distance < 1000) return 'just now';
  const threshKeys = Object.keys(thresholds);
  let prevThresh = 0;
  for (let i = 1; i < threshKeys.length; i++) {
    const thresh = thresholds[threshKeys[i]];
    if (distance < thresh) {
      const roundDistance = Math.round(distance / prevThresh);
      const units = `${threshKeys[i - 1]}${roundDistance === 1 ? '' : 's'} ago`;
      return `${roundDistance} ${units}`;
    }
    prevThresh = thresh;
  }
  // this is both for eslint, and for chuckles. It should never happen:
  return 'infinitely long ago';
}
