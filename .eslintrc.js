module.exports = {
    "env": {
        "es6": true,
        "browser": true,
        "node": true,
        "jasmine": true
    },
    "globals": {
        "$": true,
        "_": true,
        "Vue": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/base"
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "no-unused-vars": [
            "error",
            { "vars": "local" }
        ],
        "no-console": [
            "error",
            { "allow": [ "info", "warn", "error" ] }
        ],
        "no-warning-comments": "warn",
        "semi": [
            "error",
            "always",
            { "omitLastInOneLineBlock": true }
        ],
        "no-fallthrough": [
            "error",
            { "commentPattern": "break[\\s\\w]*omitted" }
        ],
        "vue/script-indent": "off"
    },
    "overrides": [
      {
        "files": ["*.spec.js"],
        "rules": {
          "semi": "off",
          "no-unused-vars": "off",
          "no-undef": "off"
        }
      },
      {
        "files": ["isoLookup.js","uniques.js"],
        "rules": {
            "indent": [
                "error",
                2
            ]
        }
      },
      {
        "files": ["_src/config/index.js", "world-50m.js","isoLookup.js","uniques.js"],
        "rules": {
            "quotes": [
                "error",
                "double"
            ]
        }
      },
      {
        "files": ["src/config/index.js"],
        "rules": {
            "quotes": "off"
        }
      },
      {
        "files": ["*.vue"],
        "rules": {
            "indent": "off"
        }
      }
    ]
};
