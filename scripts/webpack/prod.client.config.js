require('./utils/dotenv')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const {InjectManifest} = require('workbox-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const buildPath = path.join(PROJECT_ROOT, 'build')

// babel-plugin-relay requires a prod BABEL_ENV to remove hash checking logic. Probably a bug in the package.
process.env.BABEL_ENV = 'production'

const babelPresets = [
  [
    '@babel/preset-env',
    {
      targets: {
        browsers: ['> 1%', 'not ie 11']
      },
      bugfixes: true,
      // debug: true,
      corejs: 3,
      useBuiltIns: 'entry'
    }
  ]
]

module.exports = ({isDeploy, isStats}) => ({
  stats: {
    assets: false
  },
  devtool: 'source-map',
  mode: 'production',
  entry: {
    app: [path.join(CLIENT_ROOT, 'polyfills.ts'), path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: buildPath,
    publicPath: '/static/',
    filename: '[name]_[contenthash].js',
    chunkFilename: '[name]_[contenthash].js'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx', '.graphql'],
    fallback: {
      assert: path.join(PROJECT_ROOT, 'scripts/webpack/assert.js'),
      os: false
    },
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules']
  },
  optimization: {
    minimize: Boolean(isDeploy || isStats),
    minimizer: [
      new TerserPlugin({
        parallel: isDeploy ? 2 : true,
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
    new MiniCssExtractPlugin({
      // persist across builds, only emit 1 file per entry
      filename: '[contenthash].css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(PROJECT_ROOT, 'static/images/brand/mark-cropped-192.png')
        },
        {
          from: path.join(PROJECT_ROOT, 'static/images/brand/mark-cropped-512.png')
        },
        {
          from: path.join(PROJECT_ROOT, 'static/manifest.json')
        },
        {
          from: path.join(PROJECT_ROOT, 'static/favicon.ico')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'skeleton.html',
      template: path.join(PROJECT_ROOT, 'template.html'),
      title: 'Free Online Retrospectives | Parabol'
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.DEBUG': false
      // Environment variables go in applyEnvVarsToClientAssets.ts, not here
      // This build may be deployed to many different environments
    }),
    new InjectManifest({
      swSrc: path.join(PROJECT_ROOT, 'packages/client/serviceWorker/sw.ts'),
      swDest: 'sw.js',
      exclude: [/GraphqlContainer/, /\.map$/, /^manifest.*\.js$/, /index.html$/]
    }),
    isStats && new BundleAnalyzerPlugin({generateStatsFile: true})
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // things that need the relay plugin
        include: [path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: babelPresets,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ]
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              production: true,
              transforms: ['jsx', 'typescript']
            }
          }
        ]
      },
      {
        test: /\.js$/,
        include: [path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: babelPresets,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ]
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              production: true,
              transforms: ['jsx']
            }
          }
        ]
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
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
})
