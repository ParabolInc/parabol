// pulled straight from graphql-relay-js because of the stupid instanceof bug
import {GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import PageInfo from './types/PageInfo'
import {GQLContext} from './graphql'

function resolveMaybeThunk(thingOrThunk: any) {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk
}

export default function connectionDefinitions(config: any) {
  const {nodeType} = config
  const name = config.name || nodeType.name
  const edgeFields = config.edgeFields || {}
  const connectionFields = config.connectionFields || {}
  const resolveNode = config.resolveNode
  const resolveCursor = config.resolveCursor
  const edgeType = new GraphQLObjectType<any, GQLContext>({
    name: `${name}Edge`,
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        // breaks away from the relay practice. our backend should guarantee nonnull nodes!
        type: new GraphQLNonNull(nodeType),
        resolve: resolveNode,
        description: 'The item at the end of the edge'
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: resolveCursor,
        description: 'A cursor for use in pagination'
      },
      ...resolveMaybeThunk(edgeFields)
    })
  })

  const connectionType = new GraphQLObjectType<any, GQLContext>({
    name: `${name}Connection`,
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(PageInfo),
        description: 'Information to aid in pagination.'
      },
      edges: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(edgeType))),
        description: 'A list of edges.'
      },
      ...resolveMaybeThunk(connectionFields)
    })
  })
  return {edgeType, connectionType}
}
