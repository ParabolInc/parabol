import {
  type FieldNode,
  type GraphQLResolveInfo,
  type InlineFragmentNode,
  Kind,
  visit
} from 'graphql'

// nest-graphql-endpoint drops a fragment that's only spread inside another fragment, so it can't forward one,
// and it answers an aliased __typename, like Relay's __isTaskIntegration, in place of the __typename it resolves the type by.
// An inline fragment selects the same fields & the parent schema answers every __typename alias itself
const toNestedEndpointInfo = (info: GraphQLResolveInfo): GraphQLResolveInfo => {
  const {fieldNodes, fragments} = info
  const nestedFieldNodes = fieldNodes.map((fieldNode) =>
    visit(fieldNode, {
      FragmentSpread(node): InlineFragmentNode {
        const {typeCondition, selectionSet} = fragments[node.name.value]!
        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition,
          directives: node.directives,
          selectionSet
        }
      },
      Field(node): FieldNode | undefined {
        if (node.name.value !== '__typename' || !node.alias) return undefined
        return {...node, alias: undefined}
      }
    })
  )
  return {...info, fieldNodes: nestedFieldNodes}
}

export default toNestedEndpointInfo
