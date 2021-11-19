import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GitHubIntegration from './GitHubIntegration'
import makeMutationPayload from './makeMutationPayload'

interface Source {
  teamId: string
  userId: string
}
export const PersistGitHubSearchQuerySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PersistGitHubSearchQuerySuccess',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The affected teamId'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The affected userId'
    },
    githubIntegration: {
      type: new GraphQLNonNull(GitHubIntegration),
      description: 'The auth with the updated search queries',
      resolve: async ({teamId, userId}: Source, _args: unknown, {dataLoader}) => {
        return dataLoader.get('githubAuth').load({teamId, userId})
      }
    }
  })
})

const PersistGitHubSearchQueryPayload = makeMutationPayload(
  'PersistGitHubSearchQueryPayload',
  PersistGitHubSearchQuerySuccess
)

export default PersistGitHubSearchQueryPayload
