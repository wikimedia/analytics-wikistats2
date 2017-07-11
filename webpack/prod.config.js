const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


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

    plugins: [
        // Extract imported CSS into own file
        new ExtractTextPlugin('[name].bundle.[chunkhash].css'),
        // Minify JS
        new UglifyJSPlugin(),
        // Minify CSS
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
});


// module.exports = merge(baseConfig, {
//     output: {
//         filename: '[name].bundle.[chunkhash].js',,
//         path: utils.resolve('dist')
//     },
//     resolve: {
//         // in dev mode, vue needs to run with this version
//         alias: {
//             'vue$': 'vue/dist/vue.esm.js'
//         }
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader',
//                 include: [utils.resolve('src'), utils.resolve('test')]
//             },
//         ]
//     },
//     plugins: [
//         // Extract imported CSS into own file
//         new ExtractTextPlugin('[name].bundle.[chunkhash].css'),
//         // Minify JS
//         new UglifyJSPlugin(),
//         // Minify CSS
//         new webpack.LoaderOptionsPlugin({
//             minimize: true,
//         }),
//     ],
// });
