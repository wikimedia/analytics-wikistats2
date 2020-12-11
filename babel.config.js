module.exports = {
    env: {
        production: {
            presets: [["@babel/env", {
                "targets": {
                    "browsers": ["last 2 versions"]
                },
                "useBuiltIns": 'usage',
                "exclude": ['proposal-dynamic-import'],
                }
            ]],
              "plugins": [
                "dynamic-import-webpack"
              ]
        },
        test: {
            presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
              "plugins": [
                "dynamic-import-webpack"
              ]
        }
    }
};