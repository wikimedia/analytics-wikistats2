const webpackConfig = require('./webpack.config.js');

const testConfiguration = {
    browsers: ['Chrome'],

    frameworks: ['jasmine-ajax', 'jasmine'],

    files: [{
        pattern: './test/**/*.spec.js',
        watched: false,
        included: true,
        served: true
    }],

    webpack: webpackConfig,

    preprocessors: {
        './test/**/*.spec.js': ['webpack']
    }
}

module.exports = function (config) {
    config.set(testConfiguration)
    return config;
}
