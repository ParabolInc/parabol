import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const PageInfoDateCursor = new GraphQLObjectType<any, GQLContext>({
  name: 'PageInfoDateCursor',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?'
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?'
    },
    startCursor: {
      type: GraphQLISO8601Type,
      description: 'When paginating backwards, the cursor to continue.'
    },
    endCursor: {
      type: GraphQLISO8601Type,
      description: 'When paginating forwards, the cursor to continue.'
    }
  })
})

export default PageInfoDateCursor
