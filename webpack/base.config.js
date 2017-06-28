const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');


module.exports = {
    entry: './src/main.js',
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        // vue-loader isn't compiling templates with the
        // default version of vue
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: true
        }),
        new webpack.ProvidePlugin({
            $ : "jquery",
            jQuery : "jquery",
            "window.jQuery" : "jquery",
            "root.jQuery" : "jquery"
        }),
        // this hides some warnings that ajv > 5.0 resolves
        // but webpack isn't yet upgraded to ajv 5+, fix per
        // https://github.com/epoberezkin/ajv/issues/117#issuecomment-198328830
        new webpack.IgnorePlugin(
            /ajv/
        ),
    ],
    devServer: {
        contentBase: utils.resolve('dist'),
        compress: true,
        port: 8080
    },
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
}
