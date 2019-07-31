const resolve = require('./webpackResolve')
const path = require('path')
const webpack = require('webpack')
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const vendors = require('./dll/vendors')
const pluginInlineImport = require('babel-plugin-inline-import').default
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const pluginMacros = require('babel-plugin-macros')
const nodeExternals = require('webpack-node-externals');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const PACKAGE_ROOT = path.join(PROJECT_ROOT, 'packages')
const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [
      [pluginMacros, {
        relay: {
          artifactDirectory: path.join(SERVER_ROOT, '..', 'client', '__generated__')
        },
      }],
      pluginInlineImport,
      pluginDynamicImport,
    ]
  }
}

module.exports = {
  target: 'node',
  devtool: 'eval',
  mode: 'development',
  entry: {
    app: [path.join(SERVER_ROOT, 'server.ts')]
  },
  output: {
    path: path.join(PROJECT_ROOT, 'server'),
    filename: '[name].js',
    publicPath: '/static/'
  },
  resolve,
  plugins: [
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ PACKAGE_ROOT],
        exclude: [/node_modules/],
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
        include: [ PACKAGE_ROOT],
        exclude: [/node_modules/],
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
