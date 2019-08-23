const resolve = require('./webpackResolve')
const path = require('path')
const webpack = require('webpack')
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const vendors = require('./dll/vendors')
const pluginInlineImport = require('babel-plugin-inline-import').default
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const pluginMacros = require('babel-plugin-macros')

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')

const babelLoader = {
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
      pluginDynamicImport
    ]
  }
}

module.exports = {
  devtool: 'eval',
  mode: 'development',
  entry: {
    app: [path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: path.join(PROJECT_ROOT, 'build'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/static/'
  },
  resolve,
  plugins: [
    // reliably produces errors on rebuild, disabled for now
    // new HardSourceWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('development'),
      __STATIC_IMAGES__: JSON.stringify(`/static/images`)
    }),
    new webpack.DllReferencePlugin({
      manifest: vendors
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [CLIENT_ROOT],
        use: [
          babelLoader,
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'flow']
            }
          }
        ]
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.tsx?$/,
        include: [CLIENT_ROOT],
        use: [
          babelLoader,
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'typescript']
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
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      }
    ]
  }
}
