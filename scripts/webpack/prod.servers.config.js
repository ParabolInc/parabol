const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./transformRules')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor', 'src')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/dotenv.js')

module.exports = {
  devtool: 'inline-source-map',
  mode: 'production',
  node: {
    __dirname: false
  },
  entry: {
    web: [DOTENV, path.join(SERVER_ROOT, 'server.ts')],
    gqlExecutor: [DOTENV, path.join(GQL_ROOT, 'gqlExecutor.ts')],
    // TODO add more helpers like this
    updateSchema: path.join(SERVER_ROOT, 'utils', 'updateGQLSchema.ts')
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dist'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client/lib': CLIENT_ROOT,
      'parabol-server/lib': SERVER_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
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
