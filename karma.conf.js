const webpackConfig = require('./webpack/dev.config.js');

const testConfiguration = {
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    customLaunchers: {
        FirefoxHeadless: {
            base: 'Firefox',
            flags: [ '-headless' ],
        },
    },
    frameworks: ['jasmine-ajax', 'jasmine'],

    files: [
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
