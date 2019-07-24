const pluginModuleResolver = require('babel-plugin-module-resolver').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetEnv = require('@babel/preset-env').default
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default
const presetTypescript = require('@babel/preset-typescript').default
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default
const pluginRelay = require('babel-plugin-relay')
// used for importing githubQuery .graphql files as strings
const pluginInlineImport = require('babel-plugin-inline-import').default

// .tsx required for email SSR
const extensions = ['.js', '.ts', '.tsx', '.graphql']
require('@babel/register')({
  ignore: [/node_modules/],
  extensions,
  plugins: [
    pluginInlineImport,
    pluginDynamicImport,
    pluginObjectRestSpread,
    pluginClassProps,
    [
      pluginModuleResolver,
      {
        extensions,
        root: ['./packages']
      }
    ],
    [pluginRelay, {artifactDirectory: '../client/__generated__'}]
  ],
  presets: [
    [
      presetEnv,
      {
        targets: {
          node: 'current'
        }
      }
    ],
    presetFlow,
    presetReact,
    presetTypescript
  ]
})
