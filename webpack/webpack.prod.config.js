require('../packages/server/babelRegister')
const resolve = require('./webpackResolve')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const getWebpackPublicPath = require('../packages/server/utils/getWebpackPublicPath')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const {getS3BasePath} = require('./utils/getS3BasePath')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const getDotenv = require('../packages/client/utils/dotenv')
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import')
const presetEnv = require('@babel/preset-env')
const presetFlow = require('@babel/preset-flow')
const presetReact = require('@babel/preset-react')
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread')
const pluginClassProps = require('@babel/plugin-proposal-class-properties')
const pluginRelay = require('babel-plugin-relay')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const pluginInlineImport = require('babel-plugin-inline-import').default
const {InjectManifest} = require('workbox-webpack-plugin')

getDotenv.default()

const CLIENT_ROOT = path.join(__dirname, '..')
const PROJECT_ROOT = path.join(CLIENT_ROOT, '..', '..')
const publicPath = getWebpackPublicPath.default()
const buildPath = path.join(PROJECT_ROOT, 'build')

// babel-plugin-relay requires a prod BABEL_ENV to remove hash checking logic. Probably a bug in the package.
process.env.BABEL_ENV = 'production'

const extraPlugins = []
if (process.env.WEBPACK_DEPLOY) {
  extraPlugins.push(
    new S3Plugin({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      },
      s3UploadOptions: {
        Bucket: process.env.AWS_S3_BUCKET
      },
      basePath: getS3BasePath(),
      directory: buildPath
    })
  )
}

if (process.env.WEBPACK_STATS) {
  extraPlugins.push(new BundleAnalyzerPlugin({generateStatsFile: true}))
  // extraPlugins.push(new BundleBuddyWebpackPlugin())
}
const babelConfig = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [
      pluginInlineImport,
      pluginObjectRestSpread,
      pluginClassProps,
      pluginDynamicImport,
      [pluginRelay, {artifactDirectory: path.join(CLIENT_ROOT, '__generated__')}]
    ],
    presets: [
      [
        presetEnv,
        {
          targets: {
            browsers: ['> 1%', 'not ie 11']
          },
          corejs: 3,
          useBuiltIns: 'entry'
        }
      ],
      presetFlow,
      presetReact
    ]
  }
}

module.exports = {
  stats: {
    assets: false
  },
  mode: 'production',
  entry: {
    app: [path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: buildPath,
    publicPath,
    filename: '[name]_[hash].js',
    chunkFilename: '[name]_[chunkhash].js'
  },
  resolve,
  optimization: {
    minimize: Boolean(process.env.WEBPACK_DEPLOY || process.env.WEBPACK_STATS),
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: process.env.WEBPACK_DEPLOY ? 2 : true,
        sourceMap: true, // Must be set to true if using source-maps in production
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
    ],
    splitChunks: {
      chunks: 'all',
      // OK to be above 6 because we serve these via http2
      maxAsyncRequests: 20,
      maxInitialRequests: 20,
      minSize: 4096
    }
  },
  plugins: [
    // new GenerateSW(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'packages', 'server', 'template.html')
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'onerror',
        value: 'fallback(this)'
      }
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[hash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    new InjectManifest({
      swSrc: path.join(CLIENT_ROOT, 'sw.ts'),
      importWorkboxFrom: 'disabled'
    }),
    ...extraPlugins
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: babelConfig
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.tsx?$/,
        include: [CLIENT_ROOT],
        use: [
          babelConfig,
          {
            loader: 'awesome-typescript-loader',
            options: {
              errorsAsWarnings: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096
            }
          }
        ]
      },
      // for graphiql, since graphql uses mjs files to run in the server
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      }
    ]
  }
}
