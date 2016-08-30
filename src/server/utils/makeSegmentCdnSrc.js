
/**
 * Generate the link to the segment.io analytics.js source:
 */

export default (key, cdn = 'cdn.segment.com') => {
  if (!key) {
    return '';
  }
  return `http://${cdn}/analytics.js/v1/${key}/analytics.min.js`;
};
