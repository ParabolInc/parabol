import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GitHubIntegration from './GitHubIntegration'
import makeMutationPayload from './makeMutationPayload'

export const PersistGitHubQuerySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PersistGitHubQuerySuccess',
  fields: () => ({
    githubIntegration: {
      type: GitHubIntegration,
      description: 'The updated GitHub Auth',
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return await dataLoader.get('githubAuth').load({teamId, userId})
      }
    }
  })
})

const PersistGitHubQueryPayload = makeMutationPayload(
  'PersistGitHubQueryPayload',
  PersistGitHubQuerySuccess
)

export default PersistGitHubQueryPayload
