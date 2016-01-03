# Javascript Modules

Here we describe – in alphabetical order – which javascript modules are used within this project and *why* they are included.


## Development


### `babel-core`

Core requirement to transpile ES6 project-wide.


### `babel-loader`

Allow transpiling JavaScript files using Babel and webpack.


### `babel-plugin-syntax-class-properties`

Allow parsing of class properties.


### `babel-plugin-syntax-decorators`

Allow parsing of decorators.

Example: `@DragDropContext(HTML5Backend)`.
These annotations allow us to attach functionality to classes and their methods.


### `babel-plugin-syntax-object-rest-spread`

Allow parsing of object rest/spread.

Example: `const {a, b, ...props} = this.props.``
This syntax allows us to easily extract specific properties from an object.


### `babel-plugin-transform-decorators-legacy`

A plugin for Babel 6 that (mostly) replicates the old decorator behavior
from Babel 5.


### `babel-plugin-transform-object-rest-spread`

Compile object rest and spread to ES5.


### `babel-plugin-transform-class-properties`

(Presumably) allows for transformation of parsed class properties to ES5.


### `babel-preset-es2015`

Babel preset for all es2015 plugins.


### `babel-preset-react`

Strip flow types and transform JSX into createElement calls.

### `copy-webpack-plugin`

We use this to copy sails.io.js from `assets/js/dependencies` unmolested.


### `file-loader`

Static file loader for webpack.


## Production


### `react`

React is a JavaScript library for building user interfaces.


### `react-dom`

React package for working with the DOM.

`react-dom` is needed as React can be used to target multiple systems
(DOM, mobile, terminal, i.e.,). Given we're dealing with the browser,
`react-dom` is the correct choice here.


### `sails-webpack`

Use webpack instead of grunt to build assets.
