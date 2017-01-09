
/*
 * Polyfill if native fetch is supported
 */

/* eslint-disable global-require */
export default self.fetch || require('fetch-ponyfill')().fetch;
export const Headers = self.Headers || require('fetch-ponyfill')().Headers;
export const Request = self.Headers || require('fetch-ponyfill')().Request;
export const Response = self.Headers || require('fetch-ponyfill')().Response;
/* eslint-enable global-require */
