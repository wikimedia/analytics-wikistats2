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
            // Replacing googleapis fonts in semantic with ...ahem nothing so they do not run
            // the css needed is included in lato.css
            {
                test: /semantic\.css$/,
                loader: 'string-replace-loader',
                options: {
                    search: 'https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin',
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
