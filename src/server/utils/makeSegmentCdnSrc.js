
/**
 * Generate the link to the segment.io analytics.js source:
 */

export default (key, proto = 'http', cdn = 'cdn.segment.com') => {
  if (!key) {
    return '';
  }
  proto = process.env.PROTO || proto;
  return `${proto}://${cdn}/analytics.js/v1/${key}/analytics.min.js`;
};
