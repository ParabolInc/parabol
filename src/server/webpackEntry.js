import getWebpackPublicPath from './utils/getWebpackPublicPath';

/*
 * Setup webpack runtime public path loading, used for configuring
 * asset loading from our CDN:
 */

/* eslint-disable camelcase, no-undef */
__webpack_public_path__ = getWebpackPublicPath();
module.exports = require('universal/modules/landing/containers/Landing/LandingContainer');
/* eslint-enable */
