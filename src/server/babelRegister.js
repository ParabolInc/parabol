const pluginModuleResolver = require('babel-plugin-module-resolver').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetEnv = require('@babel/preset-env').default
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default
const presetTypescript = require('@babel/preset-typescript').default
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default

const extensions = ['.js', '.ts']
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
    ]
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
