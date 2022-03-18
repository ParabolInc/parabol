import fs from 'fs'
import core, {Transform} from 'jscodeshift/src/core'
import path from 'path'

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {source, path: absPath} = fileInfo
  const root = j(source)
  // Get the name of the Type
  const typeName = root.find(j.ExportDefaultDeclaration).get().value.declaration.name
  const resolversName = `${typeName}Resolvers`
  const sourceTypeName = `${typeName}Source`
  //
  const resolverMapProperties = [] as core.ObjectProperty[]
  root.find(j.ObjectProperty, {key: {name: 'resolve'}}).forEach((node) => {
    const key = node.parent.parent.value.key.name
    const value = node.value.value as core.ArrowFunctionExpression
    // console.log(value)
    value.params.forEach((param) => {
      if ('typeAnnotation' in param) {
        param.typeAnnotation = null
      }
    })
    const entry = j.objectProperty.from({
      key: j.identifier(key),
      value,
    })
    resolverMapProperties.push(entry)
  })

  const obj = j.objectExpression.from({
    properties: resolverMapProperties
  })
  const objStr = j(obj).toSource()
  let importStrs = ''
  const importDecs = root.find(j.ImportDeclaration).forEach((imp, idx) => {
    const bof = idx === 0 ? '' : '\n'
    importStrs += bof + j(imp.get()).toSource()
  })
  const typeImport = `import {${resolversName}} from '../resolverTypes'`
  const sourceExport = `export type ${sourceTypeName} = any`
  const varDef = `const ${typeName}: ${resolversName} = ${objStr}`
  const exportLine = `export default ${typeName}`
  const newDoc = `${importStrs}
${typeImport}

${sourceExport}

${varDef}

${exportLine}`

  const prettyNewDoc = j(newDoc).toSource({
     objectCurlySpacing: false,
    quote: 'single'
  })

  const {ext} = path.parse(absPath)

  const newPath = path.join(absPath, `../../../private/${typeName}${ext}`)
  fs.writeFileSync(newPath, prettyNewDoc)
}

module.exports = transform
