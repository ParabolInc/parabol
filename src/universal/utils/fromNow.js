export const thresholds = {
  second: 1000,
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2592000000,
  year: 31536000000,
  inf: Infinity
};

export default function fromNow(maybeTime) {
  const time = new Date(maybeTime);
  const now = Date.now();
  const distance = Math.abs(now - time) || 0;
  const ago = now > time ? ' ago' : '';
  if (distance < 1000) return 'just now';
  const threshKeys = Object.keys(thresholds);
  let prevThresh = 1000;
  for (let i = 1; i < threshKeys.length; i++) {
    const thresh = thresholds[threshKeys[i]];
    if (distance < thresh) {
      const roundDistance = Math.round(distance / prevThresh);
      const units = `${threshKeys[i - 1]}${roundDistance === 1 ? '' : 's'}${ago}`;
      return `${roundDistance} ${units}`;
    }
    prevThresh = thresh;
  }
  throw new Error('Infinite timestamp calculated!');
}
