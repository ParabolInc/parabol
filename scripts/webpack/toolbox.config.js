const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const webpack = require('webpack')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const TOOLBOX_SRC = path.join(PROJECT_ROOT, 'scripts/toolboxSrc')
// const CircularDependencyPlugin = require('circular-dependency-plugin')

// move __generated__ outside of src
module.exports = {
  stats: 'minimal',
  devtool: 'eval',
  mode: 'none',
  node: {
    __dirname: false
  },
  entry: {
    assignSURole: [DOTENV, path.join(TOOLBOX_SRC, 'assignSURole.ts')],
    pgRestore: [DOTENV, path.join(TOOLBOX_SRC, 'pgRestore.ts')],
    setIsEnterprise: [DOTENV, path.join(TOOLBOX_SRC, 'setIsEnterprise.ts')],
    updateSchema: [DOTENV, path.join(SERVER_ROOT, 'utils', 'updateGQLSchema.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'scripts', 'toolbox'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    unsafeCache: true
  },
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [/parabol-client/, /parabol-server/, /@dicebear/]
    })
  ],
  plugins: [
    new webpack.DefinePlugin({
      __PRODUCTION__: true
    }),
    new webpack.IgnorePlugin({resourceRegExp: /^exiftool-vendored$/, contextRegExp: /@dicebear/}),
    new webpack.IgnorePlugin({resourceRegExp: /^@resvg\/resvg-js$/, contextRegExp: /@dicebear/})
    // new CircularDependencyPlugin({
    //   // `onStart` is called before the cycle detection starts
    //   onStart({compilation}) {
    //     console.log('start detecting webpack modules cycles')
    //   },
    //   // `onDetected` is called for each module that is cyclical
    //   onDetected({module: webpackModuleRecord, paths, compilation}) {
    //     // `paths` will be an Array of the relative module paths that make up the cycle
    //     // `module` is the module record that caused the cycle
    //     compilation.errors.push(new Error(paths.join(' -> ')))
    //   },
    //   // `onEnd` is called before the cycle detection ends
    //   onEnd({compilation}) {
    //     console.log('end detecting webpack modules cycles')
    //   },
    //   // set to false to only detect cycles that include an entrypoint
    //   allowAsyncCycles: false,
    //   // set to true to detect cycles in node_modules
    //   cwd: process.cwd() // set the current working directory for displaying module paths
    // })
  ],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT, true),
      {
        test: /\.js$/,
        include: [path.join(SERVER_ROOT), path.join(CLIENT_ROOT)],
        use: [
          {
            loader: '@sucrase/webpack-loader',
            options: {
              production: true,
              transforms: ['jsx'],
              jsxRuntime: 'automatic'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['ignore-loader']
      }
    ]
  }
}
