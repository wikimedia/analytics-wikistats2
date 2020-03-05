const fs = require('fs');
const path = require('path');
const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const i18ndir = path.join(__dirname, '../src/i18n/');

module.exports = merge(baseConfig, {
    output: {
        chunkFilename: 'assets-v2/[name].[chunkhash].js',
        filename: '[name].bundle.js',
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
        })
    ],
});
