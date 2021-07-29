const fs = require('fs');
const path = require('path');
const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const i18ndir = path.join(__dirname, '../src/i18n/');

module.exports = merge(baseConfig, {
    mode: 'production',
    output: {
        chunkFilename: 'assets-v2/[name].[chunkhash].js',
        filename: '[name].bundle.js',
        path: utils.resolve('dist'),
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [utils.resolve('src')]
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    }, 'css-loader'
                ],
            },
            // Replacing google imports in semantic with ...ahem nothing so they do not run
            // the css needed is included in lato.css
            {
                test: /semantic\.css$/,
                loader: 'string-replace-loader',
                options: {
                    search: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400%3B0,700%3B1,400%3B1,700&subset=latin&display=swap',
                    replace: '',
                    strict: true
                }
            }
        ]
    },

    plugins: [
        // Minify CSS
        new MiniCssExtractPlugin({
            chunkFilename: 'assets-v2/chunk-[id].css'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        })
    ],
});
