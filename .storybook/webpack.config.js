// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const path = require('path');

const webpack = require('webpack');

const root = process.cwd();

const clientInclude = [
  path.join(root, 'src', 'client'),
  path.join(root, 'src', 'universal')
];

module.exports = {
  plugins: [
    // your custom plugins
    new webpack.DefinePlugin({
      __PRODUCTION__: false
    })
  ],
  module: {
    rules: [
      {test: /\.(png|jpg|jpeg|gif|svg)(\?\S*)?$/, loader: 'url-loader?limit=1000'},
      {test: /\.(eot|ttf|wav|mp3|woff|woff2)(\?\S*)?$/, loader: 'file-loader'}
    ]
  },
  resolve: {
    modules: [path.join(root, 'src'), 'node_modules']
  }
};
