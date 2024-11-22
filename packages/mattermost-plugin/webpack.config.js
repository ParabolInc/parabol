const { ModuleFederationPlugin } = require("webpack").container;
//const path = require("path");

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
      filename: "remoteEntry.js",
      exposes: {
        "./button": "./button",
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
};
