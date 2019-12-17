const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const VERSION = JSON.stringify(require("../package.json").version);

module.exports = {
    entry: './src/main.js',
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
             use: ExtractTextPlugin.extract({
                 fallback: "style-loader",
                 use: "css-loader"
            })
            },
            // Replacing google imports in semantic with ...ahem nothing so they do not run
            // the css needed is included in lato.css
            {
                test: /semantic\.css$/,
                use :
                [
                {loader: 'string-replace-loader',
                    query: {
                     search: 'https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin',
                     replace: '',
                     strict: true
                    }
                }
                ]
            }
            ]
    },


    plugins: [
         // Extract imported CSS into own file
        new ExtractTextPlugin(`[name].bundle.${VERSION}.css`.replace(/"/g, '')),
        new webpack.DefinePlugin({
          VERSION
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
        // uncomment to see bundle size composition when running webpack
        // new BundleAnalyzerPlugin()

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
