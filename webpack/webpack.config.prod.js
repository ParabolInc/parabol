import path from 'path';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import WebpackShellPlugin from 'webpack-shell-plugin';
import S3Plugin from 'webpack-s3-plugin';
import {getDotenv} from '../src/universal/utils/dotenv';
import {getS3BasePath} from './utils/getS3BasePath';
import getWebpackPublicPath from '../src/server/utils/getWebpackPublicPath';
import npmPackage from '../package.json';

// Import .env and expand variables:
getDotenv();

const root = process.cwd();
const clientInclude = [
  path.join(root, 'src', 'client'),
  path.join(root, 'src', 'universal')
];


const vendor = [
  'auth0-lock',
  'react',
  'react-dom',
  'react-redux',
  'react-router',
  'redux',
  'redux-thunk'
];

const prefetches = [];
const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));

const deployPlugins = [];
if (process.env.WEBPACK_MIN) {
  deployPlugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {warnings: false},
    comments: /(?:)/,
    sourceMap: true
  }));
  const sourceMappingBase = getWebpackPublicPath();
  deployPlugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[name]_[chunkhash].js.map',
    append: `\n//# sourceMappingURL=${sourceMappingBase}[url]`
  }));
  deployPlugins.push(new webpack.LoaderOptionsPlugin({comments: false}));
}
if (process.env.WEBPACK_DEPLOY) {
  // do not deploy to S3 if running in continuous integration environment:
  deployPlugins.push(new S3Plugin({
    s3Options: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    },
    s3UploadOptions: {
      Bucket: process.env.AWS_S3_BUCKET
    },
    basePath: getS3BasePath(),
    directory: path.join(root, 'build')
  }));
}

export default {
  context: path.join(root, 'src'),
  entry: {
    app: [
      'babel-polyfill',
      'client/webpackEntry.js'
    ],
    vendor
  },
  output: {
    filename: '[name]_[chunkhash].js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(root, 'build'),
  },
  resolve: {
    extensions: ['.js'],
    modules: [path.join(root, 'src'), 'node_modules', path.join(root, 'build')]
  },
  plugins: [
    ...prefetchPlugins,
    ...deployPlugins,
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 50000}),
    new AssetsPlugin({
      path: path.join(root, 'build'),
      filename: 'assets.json',
      includeManifest: true
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __WEBPACK__: true,
      __APP_VERSION__: JSON.stringify(npmPackage.version),
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new WebpackShellPlugin({
      onBuildStart: [
        'node_modules/.bin/babel-node ./webpack/utils/buildThemeJSON.js'
      ]
    })
  ],
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)(\?\S*)?$/, loader: 'url-loader?limit=10000'},
      {test: /\.(eot|ttf|wav|mp3)(\?\S*)?$/, loader: 'file-loader'},
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: clientInclude
      },
      {
        test: /auth0-lock\/.*\.js$/,
        loaders: [
          'transform-loader/cacheable?brfs',
          'transform-loader/cacheable?packageify'
        ]
      }, {
        test: /auth0-lock\/.*\.ejs$/,
        loader: 'transform-loader/cacheable?ejsify'
      }
    ]
  }
};
