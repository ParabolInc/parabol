/*
 * Setup webpack runtime public path loading, used for configuring
 * asset loading from our CDN:
 */

/* eslint-disable camelcase, no-undef */
const getWebpackBuildPath = require('universal/utils/getWebpackBuildPath').default;
__webpack_public_path__ = getWebpackBuildPath();
module.exports = require('universal/routes/index.js');
/* eslint-enable */
