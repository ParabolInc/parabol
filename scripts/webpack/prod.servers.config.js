require('./utils/dotenv')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const cp = require('child_process')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const distPath = path.join(PROJECT_ROOT, 'dist')

const COMMIT_HASH = cp.execSync('git rev-parse HEAD').toString().trim()

module.exports = ({noDeps}) => ({
  mode: 'production',
  devtool: 'source-map',
  node: {
    __dirname: false
  },
  entry: {
    chronos: [DOTENV, path.join(PROJECT_ROOT, 'packages/chronos/chronos.ts')],
    web: [DOTENV, path.join(SERVER_ROOT, 'server.ts')],
    gqlExecutor: [DOTENV, path.join(GQL_ROOT, 'gqlExecutor.ts')],
    preDeploy: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/preDeploy.ts')],
    pushToCDN: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/pushToCDN.ts')],
    migrate: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/standaloneMigrations.ts')]
  },
  output: {
    filename: '[name].js',
    path: distPath
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      'parabol-server': SERVER_ROOT
    },
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql'],
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  target: 'node',
  externals: [
    !noDeps &&
      nodeExternals({
        allowlist: [/parabol-client/, /parabol-server/]
      })
  ].filter(Boolean),
  optimization: {
    minimize: noDeps,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: noDeps ? 2 : true,
        terserOptions: {
          output: {
            comments: false,
            ecma: 6
          },
          compress: {
            ecma: 6
          }
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  },
  plugins: [
    // Pro tip: comment this out along with stable entry files for quick debugging
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __PRODUCTION__: true,
      __PROJECT_ROOT__: JSON.stringify(PROJECT_ROOT),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
      // hardcode architecture so uWebSockets.js dynamic require becomes deterministic at build time & requires 1 binary
      'process.platform': JSON.stringify(process.platform),
      'process.arch': JSON.stringify(process.arch),
      'process.versions.modules': JSON.stringify(process.versions.modules)
    }),
    // if we need canvas for SSR we can just install it to our own package.json
    new webpack.IgnorePlugin({resourceRegExp: /^canvas$/, contextRegExp: /jsdom$/}),
    // native bindings might be faster, but abandonware & not currently used
    new webpack.IgnorePlugin({resourceRegExp: /^pg-native$/, contextRegExp: /pg\/lib/}),
    noDeps &&
      new CopyWebpackPlugin({
        patterns: [
          {
            // copy sharp's libvips to the output
            from: path.resolve(PROJECT_ROOT, 'node_modules', 'sharp', 'vendor'),
            to: 'vendor'
          }
        ]
      })
  ].filter(Boolean),
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT, true),
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        oneOf: [
          {
            // Put templates in their own directory that will get pushed to the CDN. PG Migrations will reference that URL
            test: /Template.png$/,
            include: [path.resolve(PROJECT_ROOT, 'static/images/illustrations')],
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: 'templates/[name].[ext]',
                  publicPath: distPath
                }
              }
            ]
          },
          {
            // manifest.json icons just need the file name, we'll prefix them with the CDN in preDeploy
            test: /mark-cropped-\d+.png$/,
            include: [path.resolve(PROJECT_ROOT, 'static/images/brand')],
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
            use: [
              {
                loader: 'file-loader',
                options: {
                  publicPath: distPath
                }
              }
            ]
          }
        ]
      },
      {
        include: [/node_modules/],
        test: /\.node$/,
        use: [
          {
            loader: 'node-loader',
            options: {
              // sharp's bindings.gyp is hardcoded to look for libvips 2 directories up
              // rather than do a custom build, we just output it 2 directories down (/node/binaries)
              name: 'node/binaries/[name].[ext]'
            }
          }
        ]
      }
    ]
  }
})
