// To be used with jscodeshift: https://github.com/facebook/jscodeshift

function getAssignedObjectPropertyName (path) {
  var property = path
  while (property) {
    if (property.node.type === 'ObjectProperty' && property.node.key.name) {
      return property.node.key.name
    }
    property = property.parentPath
  }
}

function getFragmentNameParts (fragmentName) {
  const match = fragmentName.match(/^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/)
  if (!match) {
    throw new Error(
      'BabelPluginGraphQL: Fragments should be named ' +
        '`ModuleName_fragmentName`, got `' +
        fragmentName +
        '`.'
    )
  }
  const module = match[1]
  const propName = match[2] || '@nocommit'
  return [module, propName]
}

export default function transformer (file, api) {
  const j = api.jscodeshift

  if (!file.source.includes('graphql`')) {
    return
  }

  return j(file.source)
    .find(j.TaggedTemplateExpression, {
      tag: {type: 'Identifier', name: 'graphql'}
    })
    .filter((path) => getAssignedObjectPropertyName(path) == null)
    .filter((path) => path.parentPath.node.type !== 'ExpressionStatement')
    .forEach((path) => {
      const text = path.node.quasi.quasis[0].value.raw
      const fragmentNameMatch = text.replace(/#.*/g, '').match(/fragment (\w+)/)
      if (!fragmentNameMatch) {
        return
      }
      const fragmentName = fragmentNameMatch[1]

      const [, propName] = getFragmentNameParts(fragmentName)

      j(path).replaceWith(j.objectExpression([j.objectProperty(j.identifier(propName), path.node)]))
    })
    .toSource()
}
