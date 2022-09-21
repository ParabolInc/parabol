import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const PrevRepoIntegration: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'PrevRepoIntegration',
  description: 'The suggested repos and projects a user can integrate with',
  fields: () => ({
    cloudId: {
      type: GraphQLID
    },
    issueKey: {
      type: GraphQLInt
    },
    lastUsedAt: {
      type: GraphQLNonNull(GraphQLISO8601Type)
    },
    nameWithOwner: {
      type: GraphQLString
    },
    service: {
      type: GraphQLNonNull(GraphQLString) // TODO
    },
    userId: {
      type: GraphQLNonNull(GraphQLID)
    }
  })
})

export default PrevRepoIntegration
