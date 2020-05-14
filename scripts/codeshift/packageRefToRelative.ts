//  jscodeshift -t ./scripts/codeshiftExplicitGql.ts ./packages/client

// if a file uses a graphql tagged template literal, this makes sure that it has an import

import {Transform} from 'jscodeshift/src/core'
import path from 'path'

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {source} = fileInfo
  const root = j(source)
  root.find(j.Identifier).forEach((identifier) => {
    if (identifier.node.name !== 'require') return
    const {parentPath} = identifier
    console.log('is req', parentPath.node.type)
    if (parentPath.node.type !== 'CallExpression') return
    const args = parentPath.get('arguments')
    console.log('arg', args.value)
    if (args.value.length !== 1) return
    const argPath = args.value[0]
    console.log('argPath', argPath)
    const importedPath = argPath.value
    console.log('import path', importedPath)
    const localImport = importedPath.slice(0, importedPath.indexOf('/'))
    const packages = ['parabol-server', 'parabol-client']
    if (!packages.includes(localImport)) return
    const from = path.dirname(fileInfo.path)
    const to = path.join(__dirname, '..', '..', 'packages', localImport, 'lib')
    const relative = path.relative(from, to)
    console.log('from', from, to, relative)
    return
    // check if this is a path that needs to be imported
    // if (!shouldImportPathBeInlined(importedPath, state)) return
    // if (len) {
    // j(imports.at(-1).get()).insertBefore(lineToInsert)
    // } else {
    // root.get().node.program.body.unshift(lineToInsert)
    // }
  })
  return root.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
}

module.exports = transform
