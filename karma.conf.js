const webpackConfig = require('./webpack/dev.config.js');

const testConfiguration = {
    browsers: ['Chrome'],

    frameworks: ['jasmine-ajax', 'jasmine'],

    files: [
        './node_modules/babel-polyfill/dist/polyfill.js',
        {
            pattern: './test/**/*.spec.js',
            watched: false,
            included: true,
            served: true
        }
    ],

    webpack: webpackConfig,

    preprocessors: {
        './test/**/*.spec.js': ['webpack']
    }
}

module.exports = function (config) {
    config.set(testConfiguration)
    return config;
}
