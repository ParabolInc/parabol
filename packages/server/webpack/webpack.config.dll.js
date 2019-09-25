const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: {
    vendors: [
      '@babel/polyfill',
      '@emotion/core',
      '@emotion/styled',
      '@mattkrick/fast-rtc-swarm',
      '@mattkrick/graphql-trebuchet-client',
      '@mattkrick/sanitize-svg',
      '@mattkrick/trebuchet-client',
      '@sentry/browser',
      'draft-js',
      'email-addresses',
      'eventemitter3',
      'fbjs',
      'flatted',
      'graphiql',
      'hoist-non-react-statics',
      'immutable',
      'intersection-observer',
      'json2csv',
      'jwt-decode',
      'linkify-it',
      'micro-memoize',
      'mousetrap',
      'ms',
      'oy-vey',
      'prop-types',
      'react',
      'react-beautiful-dnd',
      'react-copy-to-clipboard',
      'react-day-picker',
      'react-dnd',
      'react-dnd-html5-backend',
      'react-dnd-scrollzone',
      'react-dom',
      'react-dom-confetti',
      'react-helmet',
      'react-hotkey-hoc',
      'react-loadable',
      'react-redux',
      'react-relay',
      'react-router',
      'react-router-dom',
      'react-swipeable-views',
      'react-textarea-autosize',
      'react-transition-group',
      'react-virtualized',
      'redux',
      'relay-linear-publish-queue',
      'relay-runtime',
      'resize-observer-polyfill',
      'shortid',
      'string-score',
      'tayden-clusterfck',
      'tlds',
      'tslib',
      'unicode-substring'
    ]
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, 'dll'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({name: '[name]', path: path.join(__dirname, 'dll', '[name].json')}) // eslint-disable-line no-new
  ],
  module: {
    rules: [
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
}
