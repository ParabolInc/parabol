import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import ms from 'ms'
import GitHubIntegrationId from '../../../client/shared/gqlIds/GitHubIntegrationId'
import updateGitHubSearchQueries from '../../postgres/queries/updateGitHubSearchQueries'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import GitHubSearchQuery from './GitHubSearchQuery'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitHubIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubIntegration',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite key',
      resolve: ({teamId, userId}) => GitHubIntegrationId.join(teamId, userId)
    },
    accessToken: {
      description: 'The access token to github. good forever',
      type: GraphQLID,
      resolve: async ({accessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    },
    githubSearchQueries: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GitHubSearchQuery))),
      description:
        'the list of suggested search queries, sorted by most recent. Guaranteed to be < 60 days old',
      resolve: async ({githubSearchQueries, teamId, userId}) => {
        const expirationThresh = ms('60d')
        const thresh = new Date(Date.now() - expirationThresh)
        const unexpiredQueries = githubSearchQueries.filter((query) => query.lastUsedAt > thresh)
        if (unexpiredQueries.length < githubSearchQueries.length) {
          await updateGitHubSearchQueries({teamId, userId, githubSearchQueries: unexpiredQueries})
        }
        return unexpiredQueries
      }
    },
    login: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The GitHub login used for queries'
    },
    scope: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The comma-separated list of scopes requested from GitHub'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    }
  })
})

export default GitHubIntegration
