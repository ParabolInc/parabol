/*
 Usage: jscodeshift --extensions=tsx --parser=tsx -t ./scripts/codeshift/convertToUseFragment.ts ./packages/client/components/TeamArchived.tsx
 This codemod converts a component using 'createFragmentContainer' to use 'useFragment'.
*/

import {Transform} from 'jscodeshift/src/core'

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {statement} = j.template
  const {source} = fileInfo

  const root = j(source)

  const functionExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'createFragmentContainer'
    }
  })

  if (functionExpressions.size() !== 1) {
    throw new Error('trying to convert file with multiple fragment containers')
  }

  const functionExpression = functionExpressions.get().value

  const replacementExport = functionExpression.arguments[0]
  const fragmentProps = functionExpression.arguments[1]

  functionExpressions.replaceWith(replacementExport)

  const componentName = replacementExport.name

  console.log(fragmentProps)
  const propMap = {}
  fragmentProps.properties.forEach((prop) => {
    propMap[prop.key.name] = prop.value
  })

  // Find the component we're changing
  const component = root.find(j.VariableDeclarator, {id: {name: componentName}})
  if (component.size() !== 1) {
    throw new Error("can't find component!")
  }

  // Find its destructuring of props
  const propDeclaration = component.find(j.VariableDeclaration, {
    declarations: [
      {
        id: {type: 'ObjectPattern'},
        init: {type: 'Identifier', name: 'props'}
      }
    ]
  })

  if (propDeclaration.size() !== 1) {
    throw new Error('props destructured never or more than once')
  }

  const hasRenamedProps =
    propDeclaration
      .find(j.ObjectProperty)
      .filter(
        (p) =>
          p.value.key.type === 'Identifier' &&
          Object.keys(propMap).includes(p.value.key.name) &&
          p.value.value.type === 'Identifier' &&
          p.value.value.name !== p.value.key.name
      )
      .size() > 0

  if (hasRenamedProps) {
    throw new Error('props already renaming destructured prop')
  }

  propDeclaration
    .find(j.ObjectProperty)
    .filter(
      (p) =>
        p.value.key.type === 'Identifier' &&
        Object.keys(propMap).includes(p.value.key.name) &&
        p.value.value.type === 'Identifier' &&
        p.value.value.name === p.value.key.name
    )
    .replaceWith((p) => {
      // Make the destructured name appended with Ref.
      if (p.value.key.type === 'Identifier' && p.value.value.type === 'Identifier') {
        return j.objectProperty.from({
          key: p.value.key,
          value: j.identifier(`${p.value.key.name}Ref`)
        })
      }
    })

  propDeclaration.insertAfter((p) => {
    return Object.keys(propMap).map((prop) => {
      console.log(prop)
      return statement`const ${prop} = useFragment(${propMap[prop]}, ${j.identifier(
        prop + 'Ref'
      )})\n`
    })
  })

  root
    .find(j.TSInterfaceDeclaration, {id: {name: 'Props'}})
    .find(j.TSPropertySignature, {key: {type: 'Identifier'}})
    .filter((p) => Object.keys(propMap).includes((p.value.key as any).name))
    .forEach((p) => {
      if (
        p.value.typeAnnotation?.type !== 'TSTypeAnnotation' ||
        p.value.typeAnnotation.typeAnnotation.type !== 'TSTypeReference' ||
        p.value.typeAnnotation.typeAnnotation.typeName.type !== 'Identifier'
      ) {
        throw new Error(
          `invalid type for prop: ${(p.value.key as any).name}, ${p.value.initializer?.type}`
        )
      }

      const name = p.value.typeAnnotation.typeAnnotation.typeName.name

      root.find(j.Identifier, {name}).replaceWith(j.identifier(name + '$key'))
    })

  root
    .find(j.Identifier, {name: 'createFragmentContainer'})
    .replaceWith(j.identifier('useFragment'))

  return root.toSource()
}

module.exports = transform
