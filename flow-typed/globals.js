/**
 * Makes flow aware of global variables defined by the webpack define plugin.
 * Also suitable for variables that will get babelified away
 *
 * @flow
 */

// eslint-disable-next-line no-unused-vars
declare var __ACTION__: Object;

// eslint-disable-next-line no-unused-vars
declare var __RELEASE_FLAGS__: Object;

// eslint-disable-next-line no-unused-vars
declare var graphql: (strings: Array<string>) => any;
