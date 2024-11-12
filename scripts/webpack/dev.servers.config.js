require('./utils/dotenv')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const webpack = require('webpack')
const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const EMBEDDER_ROOT = path.join(PROJECT_ROOT, 'packages', 'embedder')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const DOTENV = path.join(PROJECT_ROOT, 'scripts', 'webpack', 'utils', 'dotenv.js')
const INIT_PUBLIC_PATH = path.join(SERVER_ROOT, 'initPublicPath.ts')
// const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  stats: 'minimal',
  devtool: 'source-map',
  mode: 'development',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  node: {
    __dirname: false
  },
  entry: {
    web: [DOTENV, INIT_PUBLIC_PATH, path.join(SERVER_ROOT, 'server.ts')],
    embedder: [DOTENV, INIT_PUBLIC_PATH, path.join(EMBEDDER_ROOT, 'embedder.ts')],
    gqlExecutor: [DOTENV, INIT_PUBLIC_PATH, path.join(GQL_ROOT, 'gqlExecutor.ts')],
    debugEmbedder: [DOTENV, INIT_PUBLIC_PATH, path.join(EMBEDDER_ROOT, 'debug.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev')
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT
    },
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql'],
    unsafeCache: true,
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, 'node_modules'), path.resolve(PROJECT_ROOT, 'node_modules')]
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, 'node_modules'), path.resolve(PROJECT_ROOT, 'node_modules')]
  },
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [/parabol-client/, /parabol-server/, /@dicebear/]
    })
  ],
  plugins: [
    new webpack.DefinePlugin({
      __PRODUCTION__: false
    }),
    new webpack.IgnorePlugin({resourceRegExp: /^exiftool-vendored$/, contextRegExp: /@dicebear/}),
    new webpack.IgnorePlugin({resourceRegExp: /^@resvg\/resvg-js$/, contextRegExp: /@dicebear/})
  ],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.js$/,
        include: [path.join(SERVER_ROOT), path.join(CLIENT_ROOT)],
        use: [
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx'],
              jsxRuntime: 'automatic'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  }
}
