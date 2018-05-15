import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GitHubIntegration from 'server/graphql/types/GitHubIntegration'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const AddGitHubRepoPayload = new GraphQLObjectType({
  name: 'AddGitHubRepoPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    repo: {
      type: new GraphQLNonNull(GitHubIntegration)
    }
  })
})

export default AddGitHubRepoPayload
