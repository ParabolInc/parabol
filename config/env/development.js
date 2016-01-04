/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /*
   * Enable webpack hotloading while in development mode:
   */

  http: {
    customMiddleware: function (app) {
      var webpack = require('webpack');
      var webpackConfig = require('../webpack').webpack.options;
      var compiler = webpack(webpackConfig);

      app.use(require("webpack-dev-middleware")(compiler,
        {
          noInfo: true,
          publicPath: webpackConfig.output.publicPath
        }
      ));
      app.use(require("webpack-hot-middleware")(compiler,
        { reload: true }
      ));
    },
  }

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

};
