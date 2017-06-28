const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyEsPlugin = require('uglify-es-webpack-plugin');


module.exports = merge(baseConfig, {
    output: {
        filename: '[name].bundle.[chunkhash].js',
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
    /*
     * TODO: What the hell?!  It's still using uglify somehow
    plugins: [
        // Extract imported CSS into own file
        new ExtractTextPlugin('[name].bundle.[chunkhash].css'),
        // Minify JS
        new UglifyEsPlugin(),
        // Minify CSS
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
    */
});
