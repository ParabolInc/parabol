const path = require('path')
const webpack = require('webpack')
const vendors = require('./dll/vendors')
const transformRules = require('./transformRules')

// __dirname is the location of the webpack bundle, if this is inside one
const PROJECT_ROOT = path.join(__dirname, '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')

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
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-server/lib': SERVER_ROOT,
      'parabol-client/lib': CLIENT_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    unsafeCache: true,
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      path.resolve(SERVER_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      path.resolve(SERVER_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  plugins: [
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
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.js$/,
        include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
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
              transforms: ['jsx']
            }
          }
        ]
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
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
      },
      // https://github.com/graphql/graphiql/issues/1055#issuecomment-561353578
      {
        test: /\/__tests__\//i,
        use: ['ignore-loader']
      }
    ]
  }
}
