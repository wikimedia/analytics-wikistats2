const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const VERSION = JSON.stringify(require("../package.json").version);

module.exports = {
    entry: path.resolve(__dirname , '../src/main.js'),
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            Src: path.resolve(__dirname , '../src/')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            esModule: false
                        },
                    },
                ]
            }
            ]
    },


    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
          VERSION
        }),
        new webpack.ProvidePlugin({
            $ : "jquery",
            jQuery : "jquery",
            "window.jQuery" : "jquery",
            "root.jQuery" : "jquery"
        }),
        // uncomment to see bundle size composition when running webpack
        // new BundleAnalyzerPlugin()
    ]
}
