const { merge } = require("webpack-merge");
const commonWebpackConfiguration = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(commonWebpackConfiguration, {
  mode: "production",
  output: {
    filename: "bundle.[contenthash].js",
  },
  plugins: [new CleanWebpackPlugin()],
});
