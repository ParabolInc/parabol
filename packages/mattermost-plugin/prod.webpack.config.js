const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const getProjectRoot = require('../../scripts/webpack/utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const PLUGIN_ROOT = path.join(PROJECT_ROOT, 'packages', 'mattermost-plugin')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const buildPath = path.join(PROJECT_ROOT, 'build')

// strip everything till the last node_modules directory in path
const normalizeName = (pathData) => {
  const name = pathData.chunk.name || pathData.chunk.id
  return name
  .replace(/.*node_modules/g, "")
  .trim().replace(/ +/g, "-")
}

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
module.exports = (config) => {
  const minimize = config.minimize === 'true'
  return {
    entry: "./index",
    mode: "development",
    devtool: "source-map",
    devServer: {
      allowedHosts: "all",
      //contentBase: path.join(__dirname, "dist"),
      port: 3002,
    },
    output: {
      path: buildPath,
      publicPath: "auto",
      filename: 'mattermost-plugin_[name]_[contenthash].js',
      chunkFilename: (pathData) => (`mattermost-plugin_${normalizeName(pathData)}_[contenthash].js`),
      assetModuleFilename: 'mattermost-plugin_asset_[name]_[contenthash][ext]'
    },
    resolve: {
      alias: {
        '~': path.join(CLIENT_ROOT),
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
              options: {
                postcssOptions: {
                  plugins: [
                    '@tailwindcss/postcss',
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          parallel: true,
          terserOptions: {
            mangle: true,
            compress: true
          }
        })
      ]
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
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
  }
}
