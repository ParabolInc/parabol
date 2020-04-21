const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./transformRules')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor', 'src')
// const CircularDependencyPlugin = require('circular-dependency-plugin')

// move __generated__ outside of src
module.exports = {
  stats: 'minimal',
  watch: true,
  devtool: 'eval',
  mode: 'development',
  node: {
    __dirname: false
  },
  entry: {
    web: [
      './node_modules/webpack/hot/poll?1000',
      path.join(__dirname, 'dotenv.js'),
      path.join(SERVER_ROOT, 'server.ts')
    ],
    gqlExecutor: [path.join(__dirname, 'dotenv.js'), path.join(GQL_ROOT, 'gqlExecutor.ts')],
    // TODO add more helpers like this
    updateSchema: path.join(SERVER_ROOT, 'utils', 'updateGQLSchema.ts')
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT, 'packages/client/src'),
      'parabol-server/lib': path.join(SERVER_ROOT, 'packages/server/src'),
      'parabol-client/lib': path.join(CLIENT_ROOT, 'packages/client/src')
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    unsafeCache: true,
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: [/parabol-client/, '/parabol-server/']
    })
  ],
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['ignore-loader']
      }
    ]
  }
}
