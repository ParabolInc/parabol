const path = require('path')
const webpack = require('webpack')
const npmPackage = require('../package.json')
const vendors = require('../dll/vendors.json')

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
  resolve: {
    alias: {
      'react-relay': '@mattkrick/react-relay',
      'relay-runtime': '@mattkrick/relay-runtime'
    },
    modules: [path.join(__dirname, '../src'), 'node_modules'],
    extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx']
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
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
              'transform-class-properties',
              ['relay', {artifactDirectory: './src/__generated__'}]
            ],
            presets: ['flow', 'react']
          }
        }
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
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              plugins: [
                'syntax-object-rest-spread',
                'syntax-dynamic-import',
                'transform-class-properties',
                ['relay', {artifactDirectory: './src/__generated__'}]
              ],
              presets: ['flow', 'react']
            }
          },
          {
            loader: 'awesome-typescript-loader'
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
