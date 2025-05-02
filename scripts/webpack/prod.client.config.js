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

module.exports = (config) => {
  const minimize = config.minimize === 'true'
  const isStats = false // true to analyzing bundle size
  return {
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
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          parallel: true,
          terserOptions: {
            mangle: true,
            compress: true
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
            from: path.join(PROJECT_ROOT, 'static/favicon.ico')
          }
        ]
      }),
      new HtmlWebpackPlugin({
        inject: false,
        filename: 'skeleton.html',
        template: path.join(PROJECT_ROOT, 'template.html'),
        title: 'Streamline or Replace Meetings | Parabol',
        // we'll overwrite this in preDeploy since it depends on process.env.{HOST,CDN_BASE_URL}
        publicPath: '__PUBLIC_PATH__'
      }),
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        __CLIENT__: true,
        __PRODUCTION__: true,
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
        // Environment variables go in applyEnvVarsToClientAssets.ts, not here
        // This build may be deployed to many different environments
      }),
      new InjectManifest({
        swSrc: path.join(PROJECT_ROOT, 'packages/client/serviceWorker/sw.ts'),
        swDest: 'swSkeleton.js',
        // Trying to keep GraphqlContainer out of here is difficult because there are a lot of common dependencies
        exclude: [/\.map$/, /^manifest.*\.js$/, /skeleton.html$/],
        modifyURLPrefix: {
          '': '__PUBLIC_PATH__'
        }
      }),
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash].css',
        // name refers to the chunk name, which would create 1 copy for each chunk referencing the css
        chunkFilename: '[contenthash].css'
      }),
      new webpack.optimize.MinChunkSizePlugin({
        // Too many and the extra size from the boostrapping causes bloat
        // Too few & untouched modules will get invalidated between versions
        // e.g. 100_000 -> 3.5MB bundle. 1_000 -> 4.05MB. That's a 550KB gzipped savings!
        minChunkSize: 100_000
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
                transforms: ['jsx', 'typescript'],
                jsxRuntime: 'automatic'
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
                transforms: ['jsx'],
                jsxRuntime: 'automatic'
              }
            }
          ]
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
