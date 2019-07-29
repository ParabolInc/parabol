// jscodeshift --extensions=tsx,ts,js --parser=tsx -t ./scripts/codeshiftGeneratedFile.js ./packages/client
module.exports = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const root = j(fileInfo.source)
  root.find(j.TaggedTemplateExpression).forEach((node) => {
    if (node.value.tag.name === 'graphql') {
      let hasImp = false
      root.find(j.ImportDeclaration).forEach((impNode) => {
        if (impNode.value.source.value === 'babel-plugin-relay/macro') {
          hasImp = true
        }
      })
      const imports = root.find(j.ImportDeclaration)
      const lineToInsert = `import graphql from 'babel-plugin-relay/macro'`
      const len = imports.length
      if (len) {
        j(imports.at(len -1).get()).insertAfter(lineToInsert)
      } else {
        root.get().node.program.body.unshift(lineToInsert)
      }

      if (hasImp === false) {
        console.log('missing imp', fileInfo.path)
      }
    }
  })
  return root.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
}
