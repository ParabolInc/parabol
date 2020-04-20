const relayPlugin = require('./relayPlugin')
const path = require('path')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')

const transformRelay = {
  test: /\.tsx?$/,
  // things that need the relay plugin
  include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
  // but don't need the inline-import plugin
  exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        babelrc: false,
        plugins: [relayPlugin]
      }
    },
    {
      loader: '@sucrase/webpack-loader',
      options: {
        transforms: ['jsx', 'typescript']
      }
    }
  ]
}

module.exports = transformRelay
