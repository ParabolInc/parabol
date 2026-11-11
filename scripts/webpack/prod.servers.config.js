require('./utils/dotenv')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const getCommitHash = require('./utils/getCommitHash')
const getNestedUsage = require('./utils/getNestedUsage')
const persistentCache = require('./utils/persistentCache')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const EMBEDDER_ROOT = path.join(PROJECT_ROOT, 'packages', 'embedder')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const distPath = path.join(PROJECT_ROOT, 'dist')
const INIT_SERVER_ID = path.join(SERVER_ROOT, 'initServerId.ts')
const INIT_PUBLIC_PATH = path.join(SERVER_ROOT, 'initPublicPath.ts')
const MONKEYPATCHES = path.join(SERVER_ROOT, 'monkeyPatches.ts')
const DUMP_ON_USR2 = path.join(SERVER_ROOT, 'dumpOnUSR2.ts')

const COMMIT_HASH = getCommitHash()
const runtimePlatform = `${process.platform}-${process.arch}`
const SHARP_ROOT = path.dirname(path.dirname(require.resolve('sharp', {paths: [SERVER_ROOT]})))
const SHARP_LIBVIPS_ROOT = path.dirname(
  require.resolve(`@img/sharp-libvips-${runtimePlatform}/package`, {paths: [SHARP_ROOT]})
)

module.exports = (config) => {
  const noDeps = config.noDeps === 'true'
  return {
    ...persistentCache(`servers-noDeps-${noDeps}`, __filename),
    mode: 'production',
    devtool: noDeps ? 'source-map' : undefined,
    node: {
      __dirname: false
    },
    entry: {
      web: [
        DOTENV,
        INIT_SERVER_ID,
        INIT_PUBLIC_PATH,
        MONKEYPATCHES,
        DUMP_ON_USR2,
        path.join(SERVER_ROOT, 'server.ts')
      ],
      embedder: [DOTENV, INIT_SERVER_ID, DUMP_ON_USR2, path.join(EMBEDDER_ROOT, 'embedder.ts')],
      preDeploy: [
        DOTENV,
        INIT_SERVER_ID,
        INIT_PUBLIC_PATH,
        path.join(PROJECT_ROOT, 'scripts/toolboxSrc/preDeploy.ts')
      ],
      pushToCDN: [
        DOTENV,
        // index.html & the like need the public path
        INIT_PUBLIC_PATH,
        path.join(PROJECT_ROOT, 'scripts/toolboxSrc/pushToCDN.ts')
      ],
      migrate: [
        DOTENV,
        INIT_SERVER_ID,
        path.join(PROJECT_ROOT, 'scripts/toolboxSrc/standaloneMigrations.ts')
      ],
      assignSURole: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/assignSURole.ts')]
    },
    output: {
      filename: '[name].js',
      path: distPath,
      // V8 compiles a parenthesized module factory with the bundle, so the factories land in the image's compile cache
      environment: {methodShorthand: false}
    },
    resolve: {
      alias: {
        '~': CLIENT_ROOT,
        'parabol-client': CLIENT_ROOT,
        'parabol-server': SERVER_ROOT,
        // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
        'react/jsx-runtime': require.resolve('react/jsx-runtime')
      },
      extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql']
    },
    target: 'node',
    externals: [
      !noDeps && {
        ...nodeExternals({
          allowlist: [/parabol-client/, /parabol-server/, 'node:crypto']
        }),
        sharp: 'commonjs sharp'
      }
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
        __NESTED_USAGE__: JSON.stringify(getNestedUsage()),
        // hardcode architecture so uWebSockets.js dynamic require becomes deterministic at build time & requires 1 binary
        'process.platform': JSON.stringify(process.platform),
        'process.arch': JSON.stringify(process.arch),
        'process.versions.modules': JSON.stringify(process.versions.modules)
      }),
      // native bindings might be faster, but abandonware & not currently used
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$/,
        contextRegExp: /pg\/lib/
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-cloudflare$/,
        contextRegExp: /pg\/lib/
      }),
      new webpack.IgnorePlugin({
        // metascraper's url-regex-safe prefers the re2 native binding but falls back to RegExp
        resourceRegExp: /^re2$/,
        contextRegExp: /url-regex-safe/
      }),
      new webpack.IgnorePlugin({
        // sharp statically requires a prebuilt binary for every platform, we only ship ours
        resourceRegExp: new RegExp(`^@img/sharp-(?!${runtimePlatform}/)[^/]+/sharp\\.node$`)
      }),
      new webpack.IgnorePlugin({
        // the prebuilt binary finds libvips via rpath, the dylib itself is copied below
        resourceRegExp: /^@img\/sharp-libvips-[^/]+\/binary$/
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            // copy sharp's libvips to the output
            from: SHARP_LIBVIPS_ROOT,
            to: `sharp-libvips-${runtimePlatform}`
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
        ...transformRules(PROJECT_ROOT, {isProd: true}),
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
