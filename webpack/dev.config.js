const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = merge(baseConfig, {
    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].js',
        path: utils.resolve('dist-dev')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [utils.resolve('src'), utils.resolve('test')]
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            userMessages: path.join(__dirname, '../src/i18n/en.json'),
            timeLocale: path.join(__dirname, '../node_modules/date-fns/locale/en-US')
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: true,
            favicon: 'src/assets/analytics.png'
        }),
    ]
});
