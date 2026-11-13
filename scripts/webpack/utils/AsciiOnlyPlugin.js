const PLUGIN_NAME = 'AsciiOnlyPlugin'
const NON_ASCII = /[\u0080-￿]/
const SURROGATE = /[\ud800-\udfff]/
const JAVASCRIPT_MODULE_TYPES = ['javascript/auto', 'javascript/dynamic', 'javascript/esm']

const toEscapes = (text) => {
  let escapes = ''
  for (let i = 0; i < text.length; i++) {
    escapes += `\\u${text.charCodeAt(i).toString(16).padStart(4, '0')}`
  }
  return escapes
}

// A \u escape means the same as the character it stands for in a string, a regex, a comment & an identifier
// It does not in the raw strings of a tagged template, and an identifier cannot hold an escaped surrogate pair
const findInescapableNode = (program) => {
  const pendingNodes = [program]
  while (pendingNodes.length > 0) {
    const node = pendingNodes.pop()
    if (!node || typeof node !== 'object') continue
    if (Array.isArray(node)) {
      pendingNodes.push(...node)
      continue
    }
    if (typeof node.type !== 'string') continue
    if (node.type === 'TaggedTemplateExpression') {
      if (node.quasi.quasis.some((quasi) => NON_ASCII.test(quasi.value.raw))) return node
    } else if (node.type === 'Identifier' || node.type === 'PrivateIdentifier') {
      if (SURROGATE.test(node.name)) return node
    }
    pendingNodes.push(...Object.values(node))
  }
  return undefined
}

// Node holds the source of a file as UTF-16 when it has a single non-ASCII character & as 1 byte per character when it has none
// It holds it for as long as the process runs, so the characters of web.js cost every server ~37MB
class AsciiOnlyPlugin {
  apply(compiler) {
    const {Compilation, WebpackError, sources} = compiler.webpack
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, {normalModuleFactory}) => {
      const checkModule = (parser) => {
        parser.hooks.program.tap(PLUGIN_NAME, (program) => {
          const {source, module} = parser.state
          if (typeof source !== 'string' || !NON_ASCII.test(source)) return
          const inescapableNode = findInescapableNode(program)
          if (!inescapableNode) return
          const line = inescapableNode.loc?.start.line
          module.addError(
            new WebpackError(
              `${PLUGIN_NAME}: ${module.resource}:${line} has a non-ASCII tagged template or identifier, which cannot be written as \\u escapes`
            )
          )
        })
      }
      JAVASCRIPT_MODULE_TYPES.forEach((moduleType) => {
        normalModuleFactory.hooks.parser.for(moduleType).tap(PLUGIN_NAME, checkModule)
      })
      compilation.hooks.processAssets.tap(
        // before the source map is written, so it maps the escaped bundle
        {name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY},
        (assets) => {
          Object.entries(assets).forEach(([assetName, asset]) => {
            if (!assetName.endsWith('.js')) return
            const code = asset.source()
            if (typeof code !== 'string' || !NON_ASCII.test(code)) return
            const escapedAsset = new sources.ReplaceSource(asset)
            for (const {0: nonAsciiRun, index} of code.matchAll(/[\u0080-￿]+/g)) {
              escapedAsset.replace(index, index + nonAsciiRun.length - 1, toEscapes(nonAsciiRun))
            }
            compilation.updateAsset(assetName, escapedAsset)
          })
        }
      )
    })
  }
}

module.exports = AsciiOnlyPlugin
