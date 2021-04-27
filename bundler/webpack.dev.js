const { merge } = require("webpack-merge");
const commonWebpackConfiguration = require("./webpack.common.js");

module.exports = merge(commonWebpackConfiguration, {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    contentBase: "./dist",
    watchContentBase: true,
    open: true,
    https: false,
    useLocalIp: true,
    disableHostCheck: true,
    overlay: true,
  },
});
