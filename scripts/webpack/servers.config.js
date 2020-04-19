const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const relayPlugin = require('./relayPlugin')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor', 'src')
// const CircularDependencyPlugin = require('circular-dependency-plugin')

// move __generated__ outside of src
module.exports = {
  stats: 'minimal',
  watch: true,
  devtool: 'eval',
  mode: 'development',
  node: {
    __dirname: false
  },
  entry: {
    web: [
      './node_modules/webpack/hot/poll?1000',
      path.join(SERVER_ROOT, '.dotenv.ts'),
      path.join(SERVER_ROOT, 'server.ts')
    ],
    gqlExecutor: [
      path.join(GQL_ROOT, 'utils', '.dotenv.ts'),
      path.join(GQL_ROOT, 'gqlExecutor.ts')
    ],
    // TODO add more helpers like this
    updateSchema: path.join(SERVER_ROOT, 'utils', 'updateGQLSchema.ts')
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      'parabol-client/lib': CLIENT_ROOT,
      '~': CLIENT_ROOT,
      'parabol-server/lib': SERVER_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    unsafeCache: true,
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: [/parabol-client/, '/parabol-server/']
    })
  ],
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // things that need the relay plugin
        include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
        // but don't need the inline-import plugin
        exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              plugins: [relayPlugin]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'typescript']
            }
          }
        ]
      },
      {
        test: /\.tsx?/,
        // things that don't need babel
        include: [SERVER_ROOT, GQL_ROOT],
        // things that need babel
        exclude: path.join(SERVER_ROOT, 'email'),
        use: {
          loader: '@sucrase/webpack-loader',
          options: {
            transforms: ['jsx', 'typescript']
          }
        }
      },
      {
        test: /GitHubManager\.ts/,
        // things that need inline-import
        include: path.join(CLIENT_ROOT, 'utils'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              plugins: [
                [
                  'inline-import',
                  {
                    extensions: ['.graphql']
                  }
                ]
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx', 'typescript']
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|graphql)$/,
        use: ['ignore-loader']
      }
    ]
  }
}
