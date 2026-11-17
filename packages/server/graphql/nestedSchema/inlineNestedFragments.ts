import {type GraphQLFieldResolver, type GraphQLResolveInfo, Kind, visit} from 'graphql'
import type {NestedEndpoint} from 'nest-graphql-endpoint'

// The endpoint only keeps the fragments that its selection spreads directly,
// so a fragment spread inside another fragment would reach the endpoint without its definition
const inlineFragmentSpreads = (info: GraphQLResolveInfo): GraphQLResolveInfo => {
  const {fieldNodes, fragments} = info
  const fieldNodesWithoutSpreads = fieldNodes.map((fieldNode) =>
    visit(fieldNode, {
      FragmentSpread(spread) {
        const fragment = fragments[spread.name.value]!
        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: fragment.typeCondition,
          directives: spread.directives,
          selectionSet: fragment.selectionSet
        }
      }
    })
  )
  return {...info, fieldNodes: fieldNodesWithoutSpreads}
}

const inlineNestedFragments = (endpoint: NestedEndpoint): NestedEndpoint => {
  const apiTypeName = `${endpoint.prefix}Api`
  const apiResolvers = endpoint.resolvers[apiTypeName]!
  const withInlinedFragments =
    (resolve: GraphQLFieldResolver<unknown, unknown>): GraphQLFieldResolver<unknown, unknown> =>
    (source, args, context, info) =>
      resolve(source, args, context, inlineFragmentSpreads(info))
  return {
    ...endpoint,
    resolvers: {
      ...endpoint.resolvers,
      [apiTypeName]: {
        ...apiResolvers,
        query: withInlinedFragments(apiResolvers.query),
        mutation: withInlinedFragments(apiResolvers.mutation)
      }
    }
  }
}

export default inlineNestedFragments
