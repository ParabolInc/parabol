import {GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const RemoveGitHubRepoPayload = new GraphQLObjectType({
  name: 'RemoveGitHubRepoPayload',
  fields: () => ({
    deletedId: {
      type: GraphQLID
    },
    error: {
      type: StandardMutationError
    },
    archivedTaskIds: {
      type: new GraphQLList(GraphQLID)
    }
  })
})

export default RemoveGitHubRepoPayload
