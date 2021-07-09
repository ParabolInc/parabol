import {
  BREAK,
  DocumentNode,
  GraphQLCompositeType,
  GraphQLOutputType,
  isAbstractType,
  isLeafType, visit
} from 'graphql'
import rootSchema from '../graphql/rootSchema'

const pruneLocalTypes = (doc: DocumentNode, prefix: string, returnType: GraphQLOutputType) => {
  let rootType = returnType as GraphQLCompositeType
  while ('ofType' in returnType) {
    rootType = returnType.ofType
  }
  if (rootType.name.startsWith(prefix) || isLeafType(rootType)) return
  // we know the type is a local type, which means it's either an interface or union

  let errorMultipleTypes: undefined | string[] = undefined

  const fragmentVisitor = (node) => {
    const {typeCondition} = node
    if (!typeCondition) return
    const {name} = typeCondition
    const {value} = name
    // if they're fragmenting on a GitHub something, let it be
    if (value.startsWith(prefix)) return undefined
    // from here down, they're fragmenting on a non-github type.
    //it might be an interface that resolves to a GH type,
    // or it might be a non-GH peer that we should delete
    const valueType = rootSchema.getType(value)
    // non-GH type that has no chance of resolving to a non-abstract GH type. Delete it
    if (!isAbstractType(valueType)) return null
    // it's an abstract type
    const allowableTypes = rootSchema
      .getPossibleTypes(valueType)
      .map((type) => type.name)
      .filter((name) => name.startsWith(prefix))
    // no chance of resolving to a GH type
    if (allowableTypes.length === 0) return null
    // it could resolve to too many github typese (techinically feasible by creating duplicate fragment, but OOS)
    if (allowableTypes.length > 1) {
      errorMultipleTypes = allowableTypes
      return BREAK
    }
    const [firstType] = allowableTypes

    // rename TaskIntegration to _xGitHubIssue
    return {
      ...node,
      typeCondition: {
        ...typeCondition,
        name: {
          ...name,
          value: firstType
        }
      }
    }
  }

  const fixedDoc = visit(doc, {
    InlineFragment: fragmentVisitor,
    FragmentDefinition: fragmentVisitor
  })

  if (errorMultipleTypes) {
    throw new Error(
      `Could not resolve ${rootType.name} to a single endpoint type. Got ${errorMultipleTypes}. Please fragment on each of those types or make a PR`
    )
  }
  return fixedDoc
}

export default pruneLocalTypes
