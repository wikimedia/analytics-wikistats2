const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = merge(baseConfig, {
    output: {
        filename: '[name].bundle.[chunkhash].js',
        chunkFilename: 'assets-v2/[name].[chunkhash].js',
        path: utils.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [utils.resolve('src')]
            },
        ]
    },

    plugins: [
        // Minify JS
        new UglifyJSPlugin(),
        // Minify CSS
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            favicon: 'src/assets/analytics.png',
            template: 'src/index.ejs',
            inject: false
        }),
    ],
});
