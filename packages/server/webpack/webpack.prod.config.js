require('..//babelRegister')
const resolve = require('./webpackResolve')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const getWebpackPublicPath = require('../../server/utils/getWebpackPublicPath')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const {getS3BasePath} = require('./utils/getS3BasePath')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const getDotenv = require('../utils/dotenv')
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import')
const presetEnv = require('@babel/preset-env')
const presetFlow = require('@babel/preset-flow')
const presetReact = require('@babel/preset-react')
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread')
const pluginClassProps = require('@babel/plugin-proposal-class-properties')
const pluginMacros = require('babel-plugin-macros')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const pluginInlineImport = require('babel-plugin-inline-import').default
const pluginTransformReactRemovePropTypes = require('babel-plugin-transform-react-remove-prop-types')
  .default
const {InjectManifest} = require('wrkbx')
const CopyPlugin = require('copy-webpack-plugin')
const TagsPlugin = require('html-webpack-tags-plugin')
const pluginOptionalChaining = require('@babel/plugin-proposal-optional-chaining').default
const pluginNullishCoalescing = require('@babel/plugin-proposal-nullish-coalescing-operator')
  .default

getDotenv.default()

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const buildPath = path.join(PROJECT_ROOT, 'build')
const publicPath = getWebpackPublicPath.default()

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
      [
        pluginMacros,
        {
          relay: {
            artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
          }
        }
      ],
      pluginInlineImport,
      pluginObjectRestSpread,
      pluginClassProps,
      pluginDynamicImport,
      pluginOptionalChaining,
      pluginNullishCoalescing,
      pluginTransformReactRemovePropTypes
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
    filename: '[name]_[contenthash].js',
    chunkFilename: '[name]_[contenthash].js',
    crossOriginLoading: 'anonymous'
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
    new CopyPlugin([
      {
        from: path.join(PROJECT_ROOT, 'static', 'manifest.json'),
        to: buildPath
      }
    ]),
    // new GenerateSW(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'packages', 'server', 'template.html'),
      title: 'Free Online Retrospectives | Parabol'
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'onerror',
        value: 'fallback(this)'
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'crossorigin',
        value: ''
      }
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('production'),
      __STATIC_IMAGES__: JSON.stringify(`https://${process.env.AWS_S3_BUCKET}/static`)
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[hash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    new InjectManifest({
      swSrc: 'sw.js',
      entry: path.join(PROJECT_ROOT, 'packages', 'client', 'serviceWorker', 'sw.ts'),
      swDest: 'sw.js',
      importWorkboxFrom: 'disabled',
      exclude: [/GraphqlContainer/, /\.map$/, /^manifest.*\.js$/, /index.html$/]
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
              configFileName: path.join(CLIENT_ROOT, 'tsconfig.json'),
              errorsAsWarnings: true,
              reportFiles: ['!**/sw.ts']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
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
