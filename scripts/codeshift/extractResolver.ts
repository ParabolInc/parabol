import fs from 'fs'
import core, {Collection, Transform} from 'jscodeshift/src/core'
import path from 'path'


const generateImportHeaders = (from: string, root: Collection<any>, j: core.JSCodeshift, absPath: string) => {
 let importStrs = ''
    root.find(j.ImportDeclaration).forEach((imp, idx) => {
      const absPathDir = path.dirname(absPath)
      const oldRelative = imp.value.source.value as string
      if (oldRelative.startsWith('.')) {
        const oldAbsolute = path.resolve(absPathDir, oldRelative)
        const relative = path.relative(from, oldAbsolute)
        imp.value.source.value = relative
      }
      const bof = idx === 0 ? '' : '\n'
      importStrs += bof + j(imp.get()).toSource()
    })
  return importStrs
}
const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {source, path: absPath} = fileInfo
  const IS_QUERY = absPath.includes('queries')
  const IS_MUTATION = absPath.includes('mutations')
  const IS_OPERATION = IS_QUERY || IS_MUTATION
  const root = j(source)
  // Get the name of the Type
  const typeName = root.find(j.ExportDefaultDeclaration).get().value.declaration.name
  if (!IS_OPERATION) {
    const resolversName = `${typeName}Resolvers`
    const sourceTypeName = `${typeName}Source`
    //
    const resolverMapProperties = [] as core.ObjectProperty[]
    root.find(j.ObjectProperty, {key: {name: 'resolve'}}).forEach((node) => {
      const key = node.parent.parent.value.key.name
      const value = node.value.value as core.ArrowFunctionExpression
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
    if (resolverMapProperties.length === 0) return
    const obj = j.objectExpression.from({
      properties: resolverMapProperties
    })
    const objStr = j(obj).toSource()

    const from = path.dirname(path.join(absPath, '../../../private/types/foo.ts'))
    const importStrs = generateImportHeaders(from, root, j, absPath)
    // return
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

    const newPath = path.join(absPath, `../../../private/types/${typeName}${ext}`)
    fs.writeFileSync(newPath, prettyNewDoc)
  } else {
    const value = root.find(j.ObjectProperty, {key: {name: 'resolve'}}).get().value.value
    value.params.forEach((param) => {
      if ('typeAnnotation' in param) {
        param.typeAnnotation = null
      }
    })
    const dir = IS_QUERY ? 'queries' : 'mutations'
    const from = path.dirname(path.join(absPath, `../../../private/${dir}/foo.ts`))
    const importStrs = generateImportHeaders(from, root, j, absPath)
    const typeImport = `import {QueryResolvers} from '../resolverTypes'`
    const varDef = `const ${typeName}: QueryResolvers['${typeName}'] = ${j(value).toSource()}`
    const exportLine = `export default ${typeName}`
    const newDoc = `${importStrs}
${typeImport}

${varDef}

${exportLine}`

    const prettyNewDoc = j(newDoc).toSource({
      objectCurlySpacing: false,
      quote: 'single'
    })

    const {ext} = path.parse(absPath)

    const newPath = path.join(absPath, `../../../private/${dir}/${typeName}${ext}`)
    fs.writeFileSync(newPath, prettyNewDoc)
  }
}

module.exports = transform
