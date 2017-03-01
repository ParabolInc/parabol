import {APP_WEBPACK_PUBLIC_PATH_DEFAULT} from 'universal/utils/constants';

/*
 * Setup webpack runtime public path loading, used for configuring
 * asset loading from our CDN:
 */
function getWebpackPublicPath() {
  if (typeof window !== 'undefined' && window.__ACTION__ && window.__ACTION__.cdn) {
    return window.__ACTION__.cdn;
  }

  return APP_WEBPACK_PUBLIC_PATH_DEFAULT;
}

/* eslint-disable camelcase, no-undef */
__webpack_public_path__ = getWebpackPublicPath();
module.exports = require('client/client.js');
/* eslint-enable */
