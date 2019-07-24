// Storybook has its own config. We extend it with our own config.
// Be sure to verify that this works if changing the dev config!
const devConfig = require('../packages/client/webpack/webpack.dev.config')
module.exports = (baseConfig, configType) => {
  baseConfig.plugins.push(devConfig.plugins[1]) // define plugin
  baseConfig.module.rules.push(...devConfig.module.rules) // all rules used in dev
  baseConfig.module.rules[0].use[0].loader = require.resolve('babel-loader') // use our babel-loader instead
  baseConfig.module.rules[0].use[0].options.presets = devConfig.module.rules[0].use.options.presets // use our presets
  // console.log('PLUGS', baseConfig.module.rules[0].use[0].options.plugins)
  baseConfig.module.rules[0].use[0].options.plugins = devConfig.module.rules[0].use.options.plugins // use only our plugins & override storybook plugins for now
  // baseConfig.module.rules[0].use[0].options.plugins.push(
  //   ...devConfig.module.rules[0].use.options.plugins
  // ) // JS babel extensions
  baseConfig.resolve.modules = devConfig.resolve.modules
  baseConfig.resolve.alias = devConfig.resolve.alias
  baseConfig.resolve.extensions = devConfig.resolve.extensions
  return baseConfig
}
