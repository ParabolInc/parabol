require('./utils/dotenv')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const cp = require('child_process')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const EMBEDDER_ROOT = path.join(PROJECT_ROOT, 'packages', 'embedder')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const distPath = path.join(PROJECT_ROOT, 'dist')
const INIT_PUBLIC_PATH = path.join(SERVER_ROOT, 'initPublicPath.ts')

const COMMIT_HASH = cp.execSync('git rev-parse HEAD').toString().trim()

module.exports = (config) => {
  const noDeps = config.noDeps === 'true'
  return {
    mode: 'production',
    node: {
      __dirname: false
    },
    entry: {
      chronos: [DOTENV, path.join(PROJECT_ROOT, 'packages/chronos/chronos.ts')],
      web: [
        DOTENV,
        INIT_PUBLIC_PATH,
        // each instance of web needs to generate its own index.html to use on startup
        path.join(PROJECT_ROOT, 'scripts/toolboxSrc/applyEnvVarsToClientAssets.ts'),
        path.join(SERVER_ROOT, 'server.ts')
      ],
      embedder: [DOTENV, path.join(EMBEDDER_ROOT, 'embedder.ts')],
      gqlExecutor: [DOTENV, INIT_PUBLIC_PATH, path.join(GQL_ROOT, 'gqlExecutor.ts')],
      preDeploy: [
        DOTENV,
        INIT_PUBLIC_PATH,
        path.join(PROJECT_ROOT, 'scripts/toolboxSrc/preDeploy.ts')
      ],
      pushToCDN: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/pushToCDN.ts')],
      migrate: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/standaloneMigrations.ts')],
      assignSURole: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/assignSURole.ts')]
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
          allowlist: [/parabol-client/, /parabol-server/, /@dicebear/]
        })
    ].filter(Boolean),
    optimization: {
      // When Node exits with an uncaughtException it prints the callstack, which is the line that caused the error.
      // We do not minify the server to prevent callstacks that can be longer than a terminal scrollback buffer
      // Not minifying costs us ~50MB extra, but it doesn't require sourcemaps & compiles 90s faster
      minimize: false
    },
    plugins: [
      // Pro tip: comment this out along with stable entry files for quick debugging
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        __PRODUCTION__: true,
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
      new webpack.IgnorePlugin({resourceRegExp: /^exiftool-vendored$/, contextRegExp: /@dicebear/}),
      new webpack.IgnorePlugin({resourceRegExp: /^@resvg\/resvg-js$/, contextRegExp: /@dicebear/}),
      new webpack.IgnorePlugin({resourceRegExp: /inter-regular.otf$/, contextRegExp: /@dicebear/}),
      new webpack.IgnorePlugin({resourceRegExp: /inter-bold.otf$/, contextRegExp: /@dicebear/}),

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
      parser: {
        javascript: {
          // group all chunks into its entrypoint file
          dynamicImportMode: 'eager'
        }
      },
      rules: [
        ...transformRules(PROJECT_ROOT, true),
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
        {
          include: [/node_modules/],
          test: /\.node$/,
          use: [
            {
              // use our fork of node-loader to exclude the public path from the script
              loader: path.resolve(__dirname, './utils/node-loader-private/cjs.js'),
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
  }
}
