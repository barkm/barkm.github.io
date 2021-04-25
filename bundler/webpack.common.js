const path = require("path")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCSSExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    entry: path.resolve(__dirname, "../src/script.js"),
    output:
    {
        path: path.resolve(__dirname, "../dist")
    },
    devtool: "source-map",
    plugins:
    [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/index.html"),
            minify: true
        }),
        new MiniCSSExtractPlugin()
    ],
    module:
    {
        rules:
        [
            {
                test: /\.css$/,
                use: [MiniCSSExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.glb$/,
                type: "asset/resource",
                generator: {
                    filename: "models/[name].[hash][ext]"
                }
            }
        ]
    }
}
