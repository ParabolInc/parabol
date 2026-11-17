const GRAPHQL_TAG = /\bgraphql\s*`([^`]*)`/g
const DEFINITION_NAME = /^\s*(?:query|mutation|subscription|fragment)\s+(\w+)/m
const MACRO_IMPORT = /^import graphql from ['"]babel-plugin-relay\/macro['"];?$/m

// Does the job of babel-plugin-relay without parsing the file: each graphql tag becomes an import of its artifact
// The relay compiler guarantees 1 uniquely named definition per tag & 1 artifact per definition
// A tag is replaced by as many lines as it spanned so the line numbers still match the source
function relayTagLoader(source) {
  const artifactNames = new Set()
  const code = source.replace(GRAPHQL_TAG, (tag, text) => {
    const name = DEFINITION_NAME.exec(text)?.[1]
    if (!name) throw new Error(`Could not find the name of a graphql tag in ${this.resourcePath}`)
    artifactNames.add(name)
    return `__relay_${name}${'\n'.repeat(tag.split('\n').length - 1)}`
  })
  if (artifactNames.size === 0) return source
  const imports = [...artifactNames]
    .map((name) => `import __relay_${name} from '~/__generated__/${name}.graphql';`)
    .join('')
  return `${code.replace(MACRO_IMPORT, '')}\n${imports}\n`
}

module.exports = relayTagLoader
