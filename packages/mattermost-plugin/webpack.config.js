const { ModuleFederationPlugin } = require("webpack").container;
const path = require('path')
const getProjectRoot = require('../../scripts/webpack/utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()

const clientTransformRules = (projectRoot) => {
  const clientRoot = path.join(projectRoot, 'packages', 'mattermost-plugin')
  console.log('clientRoot', clientRoot)
  return [
    {
      test: /\.tsx?$/,
      // things that need the relay plugin
      include: clientRoot,
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
                    artifactDirectory: path.join(clientRoot, '__generated__')
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
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      ...clientTransformRules(PROJECT_ROOT),
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react", "@babel/preset-typescript"],
        },
      },
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
    })
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
