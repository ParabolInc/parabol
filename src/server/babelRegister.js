const pluginModuleResolver = require('babel-plugin-module-resolver').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetEnv = require('@babel/preset-env').default
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default

require('@babel/register')({
  plugins: [
    pluginDynamicImport,
    pluginObjectRestSpread,
    pluginClassProps,
    [
      pluginModuleResolver,
      {
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
    presetReact
  ]
})
