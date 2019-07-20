const resolve = require('./webpackResolve')
const path = require('path')
const webpack = require('webpack')
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const pluginRelay = require('babel-plugin-relay')
const vendors = require('../dll/vendors')
const pluginInlineImport = require('babel-plugin-inline-import').default
// const {InjectManifest, GenerateSW} = require('workbox-webpack-plugin').default
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [
      pluginInlineImport,
      pluginDynamicImport,
      [pluginRelay, {artifactDirectory: './src/__generated__'}]
    ]
  }
}

module.exports = {
  devtool: 'eval',
  mode: 'development',
  entry: {
    app: [path.join(__dirname, '../src/client/client.js')]
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/static/'
  },
  resolve,
  plugins: [
    // reliably produces errors on rebuild, disabled for now
    // new HardSourceWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.DllReferencePlugin({
      manifest: vendors
    })
    // new GenerateSW(),
    // new InjectManifest({
    //   swSrc: './src/client/sw.ts'
    // })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, '../src/client'), path.join(__dirname, '../src/universal')],
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
        include: [
          path.join(__dirname, '../src/__generated__'),
          path.join(__dirname, '../src/client'),
          path.join(__dirname, '../src/universal'),
          path.join(__dirname, '../stories')
        ],
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
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
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
