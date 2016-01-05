var webpack = require('webpack');
var path = require('path');

// Webpack plugins
var CopyWebpackPlugin = require('copy-webpack-plugin');

// compile js assets into a single bundle file
module.exports.webpack = {
  options: {
    context: path.join(__dirname, '..'),

    devtool: 'eval',

    entry: [
      './assets/js',
      'webpack-hot-middleware/client'
    ],

    output: {
      path: path.resolve(__dirname, '../.tmp/public/assets'),
      publicPath: "/",
      filename: 'js/app.js'
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),

      /* Copy sails.io.js unmolested: */
      new CopyWebpackPlugin([
        {
          from: 'assets/js/dependencies',
          to: 'js/dependencies',
          force: true
        }
      ])
    ],

    resolve: {
      modulesDirectories: ['node_modules', './assets'],
      extensions: ['', '.js', '.jsx']
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(bower_components|node_modules)/,
          loader: 'babel',
        },
        {
          test: /\.scss$/,
          loader: 'style-loader!css-loader!postcss-loader!sass-loader'
        },
        {
          test: /\.jpe?g$|\.png$|\.gif|\.svg$/,
          loader: 'file-loader?name=images/[name].[ext]'
        },
        {
          test: /\.wav$|\.mp3$/,
          loader: 'file-loader?name=audio/[name].[ext]'
        },
        {
          test: /\.woff$|\.ttf$/,
          loader: 'file-loader?name=fonts/[name].[ext]'
        }
      ]
    }
  },

  postcss: function plugins(bundler) {
    // PostCSS plugins
    return [
      require('autoprefixer')({ browsers: ['last 2 versions'] }),
      require('postcss-color-rgba-fallback')()
    ]
  },

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
