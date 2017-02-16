import path from 'path';
import webpack from 'webpack';
import WebpackShellPlugin from 'webpack-shell-plugin';
import npmPackage from '../package.json';

const root = process.cwd();
const serverInclude = [
  path.join(root, 'src', 'server'),
  path.join(root, 'src', 'universal')
];

const prefetches = [];
const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));


export default {
  context: path.join(root, 'src'),
  entry: {prerender: '../src/server/webpackEntry.js'},
  target: 'node',
  output: {
    path: path.join(root, 'build'),
    chunkFilename: '[name]_[chunkhash].js',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  // ignore anything that throws warnings & doesn't affect the view
  externals: [
    'isomorphic-fetch',
    'es6-promisify',
    'socketcluster-client'
  ],
  resolve: {
    extensions: ['.js'],
    modules: [path.join(root, 'src'), 'node_modules', path.join(root, 'build')]
  },
  plugins: [...prefetchPlugins,
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new webpack.DefinePlugin({
      __CLIENT__: false,
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
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000'
      },
      {test: /\.(eot|ttf|wav|mp3)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader'},
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: serverInclude
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
