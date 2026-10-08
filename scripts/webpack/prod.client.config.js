require('./utils/dotenv')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getCommitHash = require('./utils/getCommitHash')
const getProjectRoot = require('./utils/getProjectRoot')
const IncrementalMinChunkSizePlugin = require('./utils/IncrementalMinChunkSizePlugin')
const ServiceWorkerPlugin = require('./utils/ServiceWorkerPlugin')
const swcLoader = require('./utils/swcLoader')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const RELAY_ARTIFACTS = path.join(CLIENT_ROOT, '__generated__')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const buildPath = path.join(PROJECT_ROOT, 'build')

const relayTagLoader = path.join(__dirname, 'utils/relayTagLoader.js')

module.exports = (config) => {
  const minimize = config.minimize === 'true'
  const sourceMaps = config.sourceMaps === 'true'
  const isStats = false // true to analyzing bundle size
  // Environment variables go in applyEnvVarsToClientAssets.ts, not here
  // This build may be deployed to many different environments
  const defines = {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __COMMIT_HASH__: JSON.stringify(getCommitHash())
  }
  return {
    stats: {
      assets: false
    },
    ignoreWarnings: [
      // framer-motion intentionally uses string concatenation for @emotion/is-prop-valid to
      // avoid static analysis by bundlers; it works fine at runtime
      {module: /framer-motion.*filter-props/}
    ],
    devtool: sourceMaps ? 'source-map' : false,
    mode: 'production',
    entry: {
      app: [path.join(CLIENT_ROOT, 'polyfills.ts'), path.join(CLIENT_ROOT, 'client.tsx')]
    },
    output: {
      path: buildPath,
      publicPath: 'auto',
      filename: '[name]_[contenthash].js',
      chunkFilename: '[name]_[contenthash].js',
      crossOriginLoading: 'anonymous',
      assetModuleFilename: '[name]_[contenthash][ext]'
    },
    resolve: {
      alias: {
        '~': CLIENT_ROOT,
        'parabol-client': CLIENT_ROOT,
        static: STATIC_ROOT,
        // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
        'react/jsx-runtime': require.resolve('react/jsx-runtime')
      },
      extensions: ['.js', '.json', '.ts', '.tsx', '.graphql'],
      fallback: {
        assert: path.join(PROJECT_ROOT, 'scripts/webpack/assert.js'),
        os: false
      }
    },
    optimization: {
      minimize,
      // The runtime holds the hash of every chunk, so it changes with every release
      // In its own tiny file, a release no longer makes returning users download the whole entry chunk again
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          // node_modules rarely change between releases, but the app code in the entry chunk almost always does
          entryVendors: {
            name: 'vendors',
            chunks: 'initial',
            test: /[\\/]node_modules[\\/]/,
            // css stays with the app so there is still only 1 render-blocking stylesheet
            type: /^javascript\//,
            enforce: true
          }
        }
      },
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          parallel: true,
          // license comments stay inline, otherwise each chunk gets a .LICENSE.txt
          extractComments: false,
          terserOptions: {
            mangle: true,
            compress: true
          }
        })
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.join(PROJECT_ROOT, 'static/favicon.ico')
          }
        ]
      }),
      new HtmlWebpackPlugin({
        inject: false,
        filename: 'skeleton.html',
        template: path.join(PROJECT_ROOT, 'template.html'),
        title: 'Retrospectives, Standups, Sprint Poker & Team Health Checks | Parabol',
        // we'll overwrite this in preDeploy since it depends on process.env.{HOST,CDN_BASE_URL}
        publicPath: '__PUBLIC_PATH__'
      }),
      new webpack.DefinePlugin({
        __CLIENT__: true,
        __PRODUCTION__: true,
        ...defines
      }),
      new ServiceWorkerPlugin({
        src: path.join(CLIENT_ROOT, 'serviceWorker/sw.ts'),
        filename: 'swSkeleton.js',
        minify: minimize,
        defines: {
          ...defines,
          // we'll overwrite this in preDeploy since it depends on process.env.{HOST,CDN_BASE_URL}
          __PUBLIC_PATH__: JSON.stringify('__PUBLIC_PATH__')
        },
        // the meeting music & the largest illustrations are more than the rest of the app combined
        maxAssetSize: 100_000,
        // only super users open GraphiQL, which is 30% of the JS & most of the CSS
        onDemandChunkGroups: ['GraphqlContainer']
      }),
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash].css',
        // name refers to the chunk name, which would create 1 copy for each chunk referencing the css
        chunkFilename: '[contenthash].css'
      }),
      new IncrementalMinChunkSizePlugin({
        // Chunks smaller than this get merged into another chunk
        // Too low & the modules shared by small chunks are duplicated in each of them, which bloats the total size
        // Too high & a small change makes returning users download big chunks again,
        // and a route that loads on demand carries modules from unrelated routes
        // Measured Oct 2026 as total gzipped JS & the download a returning user gets from a typical release:
        // 100_000 -> 3.08MB & 70-360KB. 50_000 -> 3.15MB & 55-160KB. No merging -> 3.32MB & 50-145KB
        minChunkSize: 50_000,
        // what a signed out visitor loads before the first screen renders
        unmergedChunkGroups: [
          'AnalyticsPage',
          'AuthenticationPage',
          'InvitationLinkRoot',
          'TeamInvitationRoot'
        ]
      }),
      isStats && new BundleAnalyzerPlugin({generateStatsFile: true})
    ].filter(Boolean),
    module: {
      rules: [
        {
          // relay artifacts are more than half of the client source, but they are plain data
          // their whitespace is a third of their size, and smaller modules let IncrementalMinChunkSizePlugin merge them into fewer chunks
          test: /\.ts$/,
          include: [RELAY_ARTIFACTS],
          use: [swcLoader({extension: 'ts', minify: {compress: false, mangle: false}})]
        },
        {
          test: /\.ts$/,
          include: [CLIENT_ROOT],
          exclude: [RELAY_ARTIFACTS],
          use: [swcLoader({extension: 'ts'}), relayTagLoader]
        },
        {
          test: /\.tsx$/,
          include: [CLIENT_ROOT],
          use: [swcLoader({extension: 'tsx'}), relayTagLoader]
        },
        {
          test: /\.js$/,
          include: [CLIENT_ROOT],
          use: [swcLoader({extension: 'js'}), relayTagLoader]
        },
        {test: /\.flow$/, loader: 'ignore-loader'},
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader', options: {sourceMap: false}},
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource'
        },
        // for graphiql, since graphql uses mjs files to run in the server
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        },
        {
          test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
          type: 'asset/resource'
        }
      ]
    }
  }
}
