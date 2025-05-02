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
    embedder: [DOTENV, INIT_PUBLIC_PATH, path.join(EMBEDDER_ROOT, 'embedder.ts')]
    // debugEmbedder: [DOTENV, INIT_PUBLIC_PATH, path.join(EMBEDDER_ROOT, 'debug.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev')
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT,
      // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    },
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql']
    // this is run outside the server dir, but we want to favor using modules from the server dir
  },
  target: 'node',
  externals: [
    {
      ...nodeExternals({
        allowlist: [/parabol-client/, /parabol-server/, /@dicebear/, 'node:crypto']
      }),
      sharp: 'commonjs sharp'
    }
  ],
  plugins: [
    new webpack.DefinePlugin({
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }),
    // if we need canvas for SSR we can just install it to our own package.json
    new webpack.IgnorePlugin({resourceRegExp: /^canvas$/, contextRegExp: /jsdom$/}),
    // native bindings might be faster, but abandonware & not currently used
    new webpack.IgnorePlugin({resourceRegExp: /^pg-native$/, contextRegExp: /pg\/lib/}),
    new webpack.IgnorePlugin({resourceRegExp: /^pg-cloudflare$/, contextRegExp: /pg\/lib/}),
    new webpack.IgnorePlugin({resourceRegExp: /^exiftool-vendored$/, contextRegExp: /@dicebear/}),
    new webpack.IgnorePlugin({resourceRegExp: /^@resvg\/resvg-js$/, contextRegExp: /@dicebear/}),
    new webpack.IgnorePlugin({resourceRegExp: /inter-regular.otf$/, contextRegExp: /@dicebear/}),
    new webpack.IgnorePlugin({resourceRegExp: /inter-bold.otf$/, contextRegExp: /@dicebear/})
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
      },
      {
        include: [/node_modules/],
        test: /\.node$/,
        use: [
          {
            // use our fork of node-loader to exclude the public path from the script
            loader: path.resolve(__dirname, './utils/node-loader-private/cjs.js')
          }
        ]
      }
    ]
  }
}
