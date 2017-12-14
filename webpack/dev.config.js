const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const utils = require('./utils');


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
});
