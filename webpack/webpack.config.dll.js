const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: {
    vendors: [
      'aphrodite-local-styles',
      'auth0-js',
      'core-js',
      'draft-js',
      'email-addresses',
      'emotion',
      'eventemitter3',
      'fbjs',
      'graphql',
      'graphiql',
      'immutable',
      'ms',
      'prop-types',
      'raven-js',
      'react',
      'react-async-hoc',
      'react-copy-to-clipboard',
      'react-day-picker',
      'react-dnd',
      'react-dnd-html5-backend',
      'react-dnd-scrollzone',
      'react-dom',
      'react-dom-confetti',
      'react-emotion',
      'react-fontawesome',
      'react-helmet',
      'react-hot-loader',
      'react-hotkey-hoc',
      'react-loadable',
      'react-notification-system',
      'react-portal-hoc',
      'react-redux',
      'react-relay',
      'react-router',
      'react-router-dom',
      'react-transition-group',
      'react-virtualized',
      'redux',
      'redux-form',
      'redux-raven-middleware',
      'redux-thunk',
      'relay-runtime',
      'tinycolor2',
      'tlds'
    ]
  },

  // devtool: 'eval',
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, '../build'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({name: '[name]', path: path.join(__dirname, '../dll', '[name].json')}) // eslint-disable-line no-new
  ],
  module: {
    rules: [{test: /\.flow$/, loader: 'ignore-loader'}]
  }
}
