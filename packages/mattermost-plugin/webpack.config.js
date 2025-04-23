const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const path = require('path')
const getProjectRoot = require('../../scripts/webpack/utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const PLUGIN_ROOT = path.join(PROJECT_ROOT, 'packages', 'mattermost-plugin')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')

const clientTransformRules = (pluginRoot) => {
  return [
    {
      test: /\.tsx?$/,
      // things that need the relay plugin
      include: pluginRoot,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
            babelrc: false,
            plugins: [
              [
                'macros',
                {
                  relay: {
                    artifactDirectory: path.join(pluginRoot, '__generated__')
                  }
                }
              ],
              //'react-refresh/babel'
            ]
          }
        },
        {
          loader: '@sucrase/webpack-loader',
          options: {
            transforms: ['jsx', 'typescript'],
            jsxRuntime: 'automatic'
          }
        }
      ]
    }
  ]
}
module.exports = {
  entry: "./index",
  mode: "development",
  devtool: "source-map",
  devServer: {
    allowedHosts: "all",
    //contentBase: path.join(__dirname, "dist"),
    port: 3002,
  },
  watchOptions: {
    ignored: /node_modules/
  },
  output: {
    publicPath: "auto",
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      ...clientTransformRules(PLUGIN_ROOT),
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react", "@babel/preset-typescript"],
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader',
         }
        ]
      }
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "parabol",
      filename: "mattermost-plugin-entry.js",
      exposes: {
        "./plugin": "./index",
      },
      /*
      shared: {
        react: {
          singleton: true
        },
        "react-dom": {
          singleton: true
        }
      },
      */
    }),
    new webpack.DefinePlugin({
      '__PROTO__': JSON.stringify(process.env.PROTO),
      '__HOST__': JSON.stringify(process.env.HOST),
      '__PORT__': JSON.stringify(process.env.PORT),
    }),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    redux: 'Redux',
    'react-redux': 'ReactRedux',
    'prop-types': 'PropTypes',
    'react-bootstrap': 'ReactBootstrap',
    'react-router-dom': 'ReactRouterDom',
  },
};
