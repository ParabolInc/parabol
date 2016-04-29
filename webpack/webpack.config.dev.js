import path from 'path';
import webpack from 'webpack';
import cssModulesValues from 'postcss-modules-values';
import { getDotenv } from '../src/universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

const root = process.cwd();
const clientInclude = [
  path.join(root, 'src', 'client'),
  path.join(root, 'src', 'universal')
];
const globalCSS = [
  path.join(root, 'src', 'universal', 'styles', 'global'),
  path.join(root, 'node_modules', 'font-awesome', 'css')
];

const prefetches = [];

const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));

const babelQuery = {
  plugins: [
    ['transform-decorators-legacy'],
    ['react-transform', {
      transforms: [{
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals: ['module']
      }, {
        transform: 'react-transform-catch-errors',
        imports: ['react', 'redbox-react']
      }]
    }]
  ]
};

export default {
  // devtool: 'source-maps',
  debug: true,
  devtool: 'eval',
  context: path.join(root, 'src'),
  entry: {
    app: ['babel-polyfill',
      'client/client.js',
      'webpack-hot-middleware/client']
  },
  output: {
    // https://github.com/webpack/webpack/issues/1752
    filename: 'app.js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(root, 'build'),
    publicPath: '/static/'
  },
  plugins: [
    ...prefetchPlugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __WEBPACK__: true,
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.EnvironmentPlugin([
      'AUTH0_CLIENT_ID',
      'AUTH0_DOMAIN',
      'HOST',
      'PORT'
    ])
  ],
  resolve: {
    extensions: ['.js'],
    modules: [path.join(root, 'src'), 'node_modules']
  },
  // used for joi validation on client
  node: {
    dns: 'mock',
    net: 'mock'
  },
  postcss: [cssModulesValues],
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.txt$/, loader: 'raw-loader'},
      {test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)(\?\S*)?$/, loader: 'url-loader?limit=10000'},
      {test: /\.(eot|ttf|wav|mp3)(\?\S*)?$/, loader: 'file-loader'},
      {
        test: /\.css$/,
        loader: 'style!css',
        include: globalCSS
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]!postcss', // eslint-disable-line max-len
        exclude: globalCSS,
        include: clientInclude
      },
      {
        test: /\.js$/,
        loader: 'babel',
        query: babelQuery,
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
