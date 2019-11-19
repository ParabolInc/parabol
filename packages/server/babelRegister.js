const path = require('path')
const presetEnv = require('@babel/preset-env').default
const pluginMacros = require('babel-plugin-macros')
// used for importing githubQuery .graphql files as strings
const pluginInlineImport = require('babel-plugin-inline-import').default
const pluginOptionalChaining = require('@babel/plugin-proposal-optional-chaining').default
const pluginNullishCoalescing = require('@babel/plugin-proposal-nullish-coalescing-operator')
  .default
const {addHook} = require('sucrase/dist/register')

// .tsx required for email SSR
const extensions = ['.js', '.ts', '.tsx', '.graphql']
// sucrase is 20x faster & has 100% feature parity with typescript.
addHook('.js', {transforms: ['flow', 'jsx']})
addHook('.ts', {transforms: ['typescript']})
addHook('.tsx', {transforms: ['typescript', 'jsx']})

require('@babel/register')({
  ignore: [/node_modules/],
  extensions,
  plugins: [
    [
      pluginMacros,
      {
        relay: {
          artifactDirectory: path.join('../client', '__generated__')
        }
      }
    ],
    pluginInlineImport,
    pluginOptionalChaining,
    pluginNullishCoalescing
  ],
  presets: [
    [
      presetEnv,
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
})
