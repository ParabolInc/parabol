
/*
 * Polyfill if native fetch is supported
 */

// eslint-disable-next-line global-require
export default self.fetch || require('fetch-ponyfill')().fetch;
