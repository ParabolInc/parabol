/*
 Usage: jscodeshift --extensions=tsx,ts,js --parser=tsx -t ./scripts/codeshift/extractResolver.ts ./packages/server/graphql/intranetSchema/queries
 This codemod extracts the resolve function(s) from GraphQLObjectTypes and query/mutations
 and puts them in a file by themselves, following SDL-driven development
 Shortcomings:
   - It extracts all imports, too. You'll need to run VSCode "organize imports" to removed the unused ones (see organize-imports-cli)
   - It does not pull over other helper functions at the top of the file, you'll need to copy & paste those over
   - For types, it sets the `type *Source = any`, so you'll want to manually make that more strict
     - It also doesn't add that *Sorce to the codegen.json, you'll want to do that, too
   - If you run it on a while directory, it'll recurse through subdirectories (e.g. /queries/helpers). So you'll want to move the helpers over, first
*/

import fs from 'fs'
import core, {Collection, Transform} from 'jscodeshift/src/core'
import path from 'path'

  const createArrowFunctionExpression = (j, fn) => {
    const arrowFunc = j.arrowFunctionExpression(fn.params, fn.body, false)

    arrowFunc.returnType = fn.returnType
    arrowFunc.defaults = fn.defaults
    arrowFunc.rest = fn.rest
    arrowFunc.async = fn.async

    return arrowFunc
  }

  const createArrowProperty = (j, prop) => {
    return j.objectProperty(
      j.identifier(prop.key.name),
      createArrowFunctionExpression(j, prop),
      null,
      false,
    )
  }



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
  const nameFromDeclaration = root.find(j.ExportDefaultDeclaration).get().value.declaration.name
  const {name: fallbackFromFilename} = path.parse(absPath)
  if (!nameFromDeclaration) {
    console.log(`WARNING MISSING NAME: ${absPath}. Using ${fallbackFromFilename}`)
  }
  const typeName = nameFromDeclaration || fallbackFromFilename
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
        try {
      fs.statSync(newPath)
    } catch(e) {
      // doesn't exist, let's make it
      fs.writeFileSync(newPath, prettyNewDoc)
    }
  } else {

    // Convert any methods into arrow functions
    root.find(j.ObjectMethod, {key: {name: 'resolve'}}).replaceWith((method) => {
      return createArrowProperty(j, method.node)
    })

    const resolveProp = root.find(j.ObjectProperty, {key: {name: 'resolve'}})
    const value = resolveProp.get().value.value
      value.params.forEach((param) => {
        if ('typeAnnotation' in param) {
          param.typeAnnotation = null
        }
      })
    const dir = IS_QUERY ? 'queries' : 'mutations'
    const from = path.dirname(path.join(absPath, `../../../private/${dir}/foo.ts`))
    const importStrs = generateImportHeaders(from, root, j, absPath)
    const resType = IS_QUERY ? 'QueryResolvers' : 'MutationResolvers'
    const typeImport = `import {${resType}} from '../resolverTypes'`
    const varDef = `const ${typeName}: ${resType}['${typeName}'] = ${j(value).toSource()}`
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
    try {
      fs.statSync(newPath)
    } catch(e) {
      // doesn't exist, let's make it
      fs.writeFileSync(newPath, prettyNewDoc)
    }
  }
}

module.exports = transform
