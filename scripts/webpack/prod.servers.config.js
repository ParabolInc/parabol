require('./utils/dotenv')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const S3Plugin = require('webpack-s3-plugin')
const getS3BasePath = require('./utils/getS3BasePath')
const webpack = require('webpack')
const getWebpackPublicPath = require('./utils/getWebpackPublicPath')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor')
const DOTENV = path.join(PROJECT_ROOT, 'scripts/webpack/utils/dotenv.js')
const distPath = path.join(PROJECT_ROOT, 'dist')

const publicPath = `${getWebpackPublicPath()}server/dist/`

const getNormalizedWebpackPublicPath = () => {
  let normalizedPath = publicPath
  if (normalizedPath.startsWith('//')) {
    // protocol-relative url? normalize it:
    normalizedPath = `https:${publicPath}`
  }
  return normalizedPath
}

module.exports = ({isDeploy}) => ({
  mode: 'production',
  node: {
    __dirname: false
  },
  entry: {
    web: [DOTENV, path.join(SERVER_ROOT, 'server.ts')],
    gqlExecutor: [DOTENV, path.join(GQL_ROOT, 'gqlExecutor.ts')],
    postDeploy: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/postDeploy.ts')],
    migrate: [DOTENV, path.join(PROJECT_ROOT, 'scripts/toolboxSrc/standaloneMigrations.ts')]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dist')
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      'parabol-server': SERVER_ROOT
    },
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql'],
    // this is run outside the server dir, but we want to favor using modules from the server dir
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: [path.resolve(SERVER_ROOT, '../node_modules'), 'node_modules']
  },
  target: 'node',
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.DefinePlugin({
      __PROJECT_ROOT__: JSON.stringify(PROJECT_ROOT),
      // hardcode architecture so uWebSockets.js dynamic require becomes deterministic at build time & requires 1 binary
      'process.platform': JSON.stringify(process.platform),
      'process.arch': JSON.stringify(process.arch),
      'process.versions.modules': JSON.stringify(process.versions.modules)
    }),
    // if we need canvas for SSR we can just install it to our own package.json
    new webpack.IgnorePlugin({resourceRegExp: /^canvas$/, contextRegExp: /jsdom$/}),
    // native bindings might be faster, but abandonware & not currently used
    new webpack.IgnorePlugin({resourceRegExp: /^pg-native$/, contextRegExp: /pg\/lib/}),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[fullhash].js.map',
      append: `\n//# sourceMappingURL=${getNormalizedWebpackPublicPath()}[url]`
    }),
    isDeploy &&
      new S3Plugin({
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION
        },
        s3UploadOptions: {
          Bucket: process.env.AWS_S3_BUCKET
        },
        basePath: `${getS3BasePath()}server/dist/`,
        directory: distPath
      })
  ].filter(Boolean),
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath
            }
          }
        ]
      },
      {
        include: [/node_modules/],
        test: /\.node$/,
        use: [
          {
            loader: 'node-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  }
})
