const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  "extends": [
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "eslint-config-airbnb/base",
    "eslint-config-airbnb/rules/react"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "rules": {
    "arrow-body-style": OFF,
    "arrow-parens": [
      ERROR,
      "always"
    ],
    "babel/generator-star-spacing": OFF,
    "global-require": OFF,
    "import/default": OFF,
    "import/extensions": [
      ERROR,
      "never",
      {
        "json": "always",
        "png": "always",
        "jpg": "always",
        "svg": "always",
        "ttf": "always",
        "woff2": "always"
      }
    ],
    "import/first": OFF,
    "import/no-duplicates": OFF,
    "import/named": OFF,
    "import/namespace": OFF,
    "import/no-extraneous-dependencies": OFF,
    "import/no-unresolved": OFF,
    "import/no-named-as-default": OFF,
    "comma-dangle": ["error", "never"],
    "id-length": OFF,
    "indent": [
      ERROR,
      ERROR,
      {
        "SwitchCase": WARN
      }
    ],
    "no-alert": OFF,
    "no-console": OFF,
    "no-continue": OFF,
    "no-mixed-operators": OFF,
    "no-multi-assign": OFF,
    "no-param-reassign": OFF,
    "no-plusplus": OFF,
    "no-prototype-builtins": OFF,
    "no-confusing-arrow": OFF,
    "no-underscore-dangle": OFF,
    "max-len": [
      WARN,
      140
    ],
    "object-curly-spacing": OFF,
    "react/forbid-prop-types": OFF,
    "react/jsx-filename-extension": OFF,
    "react/jsx-space-before-closing": OFF,
    "react/no-multi-comp": OFF,
    "react/no-unused-prop-types": OFF,
    "react/require-default-props": OFF
  },
  "plugins": [
    "import",
    "jest",
    "react",
  ],
  "parser": "babel-eslint",
  "settings": {
    "import/parser": "babel-eslint",
    "import/resolver": {
      "webpack": {
        "config": "webpack/prod.babel.js"
      }
    },
    "import/ignore": [
      ".scss$",
      ".css$",
      ".svg$"
    ]
  },
  "globals": {
    "__PRODUCTION__": true,
    "__CLIENT__": true,
    "__WEBPACK__": true,
    "socket": true,
    "graphql": true
  }
}
