import {GraphQLList, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const RemoveGitHubRepoPayload = new GraphQLObjectType({
  name: 'RemoveGitHubRepoPayload',
  fields: () => ({
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
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
