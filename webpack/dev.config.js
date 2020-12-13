const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = merge(baseConfig, {
    mode: 'development',
    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].js',
        path: utils.resolve('dist-dev'),
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [utils.resolve('src'), utils.resolve('test')]
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    }, 'css-loader'
                ],
            },
        ]
    },
    devServer: {
        contentBase: utils.resolve('dist-dev'),
        compress: true,
        port: 8008
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new webpack.ProvidePlugin({
            userMessages: path.join(__dirname, '../src/i18n/en.json'),
            timeLocale: path.join(__dirname, '../node_modules/date-fns/locale/en-US')
        }),
        new webpack.DefinePlugin({
            AVAILABLE_LANGUAGES: JSON.stringify(['en'])
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: true,
            favicon: 'src/assets/analytics.png'
        }),
    ]
});
