/*
 * Setup webpack runtime public path loading, used for configuring
 * asset loading from our CDN:
 */

/* eslint-disable camelcase, no-undef */
const getWebpackPublicPath = require('universal/utils/getWebpackPublicPath');
__webpack_public_path__ = getWebpackPublicPath();
module.exports = require('client/client.js');
/* eslint-enable */
