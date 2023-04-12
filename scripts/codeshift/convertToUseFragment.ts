/*
 Usage: jscodeshift --extensions=tsx --parser=tsx -t ./scripts/codeshift/convertToUseFragment.ts ./packages/client/components/TeamArchived.tsx
 This codemod converts a component using 'createFragmentContainer' to use 'useFragment'.

 As of March 14, 2023, the migration from 'createFragmentContainer' to use 'useFragment' is
 complete, so this codemod should no longer be used except as an example for future HOC to hook
 migrations.
*/

import {Transform} from 'jscodeshift/src/core'

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const {statement} = j.template
  const {source} = fileInfo

  const root = j(source)

  // Find where we're wrapping our component with 'createFragmentContainer':
  //   createFragmentContainer(MyComponent, {myProp: graphql`<fragment>`})
  const functionExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'createFragmentContainer'
    }
  })

  if (functionExpressions.size() !== 1) {
    throw new Error('trying to convert file with zero or multiple fragment containers')
  }

  const functionExpression = functionExpressions.get().value

  const replacementExport = functionExpression.arguments[0]

  let componentName
  if (replacementExport.type !== 'Identifier') {
    const replacementComponent = functionExpressions
      .find(j.CallExpression)
      .filter((path) => path.value.arguments[0].type === 'Identifier')

    if (replacementComponent.size() !== 1) {
      throw new Error('trying to convert component with non-trivial HOC wrapping')
    }

    componentName = replacementComponent.get().value.arguments[0].name
  } else {
    componentName = replacementExport.name
  }
  // Replace the call to 'createFragmentContainer' with just a reference to the component we're
  // wrapping:
  //   createFragmentContainer(MyComponent, {myProp: graphql``})
  // to
  //   MyComponent
  functionExpressions.replaceWith(replacementExport)

  // Build a map of propName -> graphql fragment.
  const fragmentProps = functionExpression.arguments[1]
  const propMap = {}
  fragmentProps.properties.forEach((prop) => {
    const conflicts = root
      .find(j.Identifier, {name: `${prop.key.name}Ref`})
      .filter((path) => j.JSXAttribute.check(path.parent))
    if (conflicts.length > 0) {
      throw new Error(`Naming conflict with ${prop.key.name}Ref`)
    }
    propMap[prop.key.name] = prop.value
  })

  // Find the declaration of the component we're changing
  const componentVarDeclaration = root.find(j.VariableDeclarator, {id: {name: componentName}})
  const componentDeclaration =
    componentVarDeclaration.size() === 1
      ? componentVarDeclaration
      : root.find(j.FunctionDeclaration, {id: {name: componentName}})

  if (componentDeclaration.size() !== 1) {
    throw new Error("can't find component!")
  }

  // Find where the component destructures its props:
  //  const {myProp} = props
  const propDestructuring = componentDeclaration.find(j.VariableDeclaration, {
    declarations: [
      {
        id: {type: 'ObjectPattern'},
        init: {type: 'Identifier', name: 'props'}
      }
    ]
  })

  if (propDestructuring.size() !== 1) {
    throw new Error('props destructured never or more than once')
  }

  // Check whether this is renaming any props when destructuring:
  //  const {myProp: otherNameForProp} = props
  const hasRenamedProps =
    propDestructuring
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
    // :TODO: (jmtaber129): Support this.
    throw new Error('prop names renamed during prop destructuring')
  }

  // Rename the destructured props to '<propName>Ref'. From
  //   const {myProp} = props
  // to
  //   const {myProp: myPropRef} = props
  propDestructuring
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

  // Insert the 'useFragment' call right after the prop destructuring:
  //   const {myProp: myPropRef} = props
  //   const myProp = useFragment(graphql`<fragment>`, myPropRef)
  propDestructuring.insertAfter(() => {
    return Object.keys(propMap).map((prop) => {
      console.log(prop)
      return statement`const ${prop} = useFragment(${propMap[prop]}, ${j.identifier(
        prop + 'Ref'
      )})\n`
    })
  })

  // Find the interface declaration for the Props type:
  //   interface Props {
  //     nonFragmentProp: string
  //     myProp: MyFragmentName_type
  //   }
  // and update the types to be a graphql key:
  //   interface Props {
  //     nonFragmentProp: string
  //     myProp: MyFragmentName_type$key
  //   }
  const didUpdateTypes =
    root
      .find(j.TSInterfaceDeclaration, {id: {name: 'Props'}})
      .find(j.TSPropertySignature, {key: {type: 'Identifier'}})
      .filter((p) => Object.keys(propMap).includes((p.value.key as any).name))
      .forEach((p) => {
        if (
          p.value.typeAnnotation?.type !== 'TSTypeAnnotation' ||
          !(
            // Must either look like:
            // myProp: myPropType_foo
            // or
            // myProp: myPropType_foo | null
            (
              (p.value.typeAnnotation.typeAnnotation.type === 'TSTypeReference' &&
                p.value.typeAnnotation.typeAnnotation.typeName.type === 'Identifier') ||
              (p.value.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
                p.value.typeAnnotation.typeAnnotation.types[0].type === 'TSTypeReference' &&
                p.value.typeAnnotation.typeAnnotation.types[0].typeName.type === 'Identifier' &&
                p.value.typeAnnotation.typeAnnotation.types[1].type === 'TSNullKeyword')
            )
          )
        ) {
          throw new Error(
            `invalid type for prop: ${(p.value.key as any).name}, ${p.value.initializer?.type}`
          )
        }

        let name

        if (
          p.value.typeAnnotation.typeAnnotation.type === 'TSTypeReference' &&
          p.value.typeAnnotation.typeAnnotation.typeName.type === 'Identifier'
        ) {
          name = p.value.typeAnnotation.typeAnnotation.typeName.name
        } else if (
          p.value.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
          p.value.typeAnnotation.typeAnnotation.types[0].type === 'TSTypeReference' &&
          p.value.typeAnnotation.typeAnnotation.types[0].typeName.type === 'Identifier' &&
          p.value.typeAnnotation.typeAnnotation.types[1].type === 'TSNullKeyword'
        ) {
          name = p.value.typeAnnotation.typeAnnotation.types[0].typeName.name
        }

        // Rename all identifiers with this name to also update the import.
        root.find(j.Identifier, {name}).replaceWith(j.identifier(name + '$key'))
      })
      .size() === Object.keys(propMap).length

  if (!didUpdateTypes) {
    throw new Error('Could not update types in interface')
  }

  // Update the import:
  //   import {createFragmentContainer} from 'react-relay'
  // to
  //   import {useFragment} from 'react-relay'
  root
    .find(j.Identifier, {name: 'createFragmentContainer'})
    .replaceWith(j.identifier('useFragment'))

  return root.toSource()
}

module.exports = transform
