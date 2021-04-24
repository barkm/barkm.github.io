const { merge } = require("webpack-merge")
const commonWebpackConfiguration = require("./webpack.common.js")

module.exports = merge(
    commonWebpackConfiguration,
    {
        mode: "development",
    }
)
