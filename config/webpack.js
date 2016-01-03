// config/webpack.js

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

// compile js assets into a single bundle file
module.exports.webpack = {
  options: {
    context: path.join(__dirname, '..'),

    devtool: 'eval',

    entry: [
      './assets/js',
    ],

    output: {
      path: path.resolve(__dirname, '../.tmp/public'),
      filename: 'bundle.js'
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),

      /* Copy sails.io.js unmolested: */
      new CopyWebpackPlugin([
        {
          from: 'assets/js/dependencies',
          to: 'dependencies',
          force: true
        }
      ]),
    ],

    resolve: {
      extensions: ['', '.js', '.jsx']
    },

    module: {
      loaders: [
        { test: /\.js$/, loaders: ['babel'] },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel',
        },
        { test: /\.css$/, loader: 'style!css' },
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
          loader: "file" }
      ]
    }
  },

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
