const path = require('path')
const webpack = require('webpack')
const npmPackage = require('../package.json')
const vendors = require('../dll/vendors.json')

module.exports = {
  devtool: 'eval',
  mode: 'development',
  entry: {
    app: path.join(__dirname, '../src/client/client.js')
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/static/'
  },
  resolve: {
    modules: [path.join(__dirname, '../src'), 'node_modules']
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(npmPackage.version),
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.DllReferencePlugin({
      manifest: vendors
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, '../src/client'), path.join(__dirname, '../src/universal')],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            plugins: [
              'syntax-object-rest-spread',
              'syntax-dynamic-import',
              ['transform-class-properties', {spec: true}],
              'transform-decorators-legacy',
              'relay'
            ],
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: ['last 1 chrome version']
                  }
                }
              ],
              'flow',
              'react'
            ]
          }
        }
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
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
