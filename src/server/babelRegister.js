const pluginModuleResolver = require('babel-plugin-module-resolver').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetEnv = require('@babel/preset-env').default
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default
const presetTypescript = require('@babel/preset-typescript').default
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default
const pluginRelay = require('babel-plugin-relay')

const extensions = ['.js', '.ts', '.tsx']
require('@babel/register')({
  extensions,
  plugins: [
    pluginDynamicImport,
    pluginObjectRestSpread,
    pluginClassProps,
    [
      pluginModuleResolver,
      {
        extensions,
        root: ['./src']
      }
    ],
    [pluginRelay, {artifactDirectory: './src/__generated__'}]
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
