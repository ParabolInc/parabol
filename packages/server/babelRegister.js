const pluginModuleResolver = require('babel-plugin-module-resolver').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetEnv = require('@babel/preset-env').default
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default
const presetTypescript = require('@babel/preset-typescript').default
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default
const pluginMacros = require('babel-plugin-macros')
// used for importing githubQuery .graphql files as strings
const pluginInlineImport = require('babel-plugin-inline-import').default
const path = require('path')

// .tsx required for email SSR
const extensions = ['.js', '.ts', '.tsx', '.graphql']
require('@babel/register')({
  ignore: [/node_modules/],
  extensions,
  plugins: [
    [pluginMacros, {
      relay: {
        artifactDirectory: path.join('../client', '__generated__')
      },
    }],
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
  ],
  // presets: [
  //   [
  //     presetEnv,
  //     {
  //       targets: {
  //         node: 'current'
  //       }
  //     }
  //   ],
  //   presetFlow,
  //   presetReact,
  //   presetTypescript
  // ]
})
