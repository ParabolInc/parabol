const path = require('path')
const nodeExternals = require('webpack-node-externals')
const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor', 'src')

// TODO
// move __generated__ outside of src
const ext = nodeExternals({
  modulesDir: '../../node_modules',
  whitelist: [/parabol-client/, '/parabol-server/']
})
module.exports = [
  {
    // devtool: 'eval',
    mode: 'development',
    node: {
      __dirname: false
    },
    // context: PROJECT_ROOT,
    // entry: [path.join(SERVER_ROOT, '.dotenv.ts'), path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
    entry: {
      main: [
        '../../node_modules/webpack/hot/poll?1000',
        path.join(SERVER_ROOT, '.dotenv.ts'),
        path.join(SERVER_ROOT, 'server.ts')
      ],
      gqlExecutor: [
        path.join(GQL_ROOT, 'utils', '.dotenv.ts'),
        path.join(GQL_ROOT, 'gqlExecutor.ts')
      ],
      updateSchema: path.join(SERVER_ROOT, 'utils', 'updateSchema.js')
    },
    output: {
      filename: '[name].js',
      path: path.join(SERVER_ROOT, '../lib')
    },
    resolve: {
      alias: {
        'parabol-client/lib': CLIENT_ROOT,
        '~': CLIENT_ROOT,
        'parabol-server/lib': SERVER_ROOT
      },
      extensions: ['.js', '.json', '.ts', '.tsx'],
      unsafeCache: true
    },
    target: 'node',
    externals: [ext],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
          exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
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
                transforms: ['jsx', 'typescript']
              }
            }
          ]
        },
        {
          test: /\.tsx?/,
          include: [SERVER_ROOT, GQL_ROOT],
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
]
