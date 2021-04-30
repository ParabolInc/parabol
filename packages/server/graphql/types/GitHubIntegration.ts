import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import ms from 'ms'
import GitHubIntegrationId from '../../../client/shared/gqlIds/GitHubIntegrationId'
import {getUserId} from '../../utils/authorization'
import GitHubServerManager from '../../utils/GitHubServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import {GitHubIssueConnection} from './GitHubIssue'
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
      resolve: async ({githubSearchQueries}) => {
        const expirationThresh = ms('60d')
        const thresh = new Date(Date.now() - expirationThresh)
        const unexpiredQueries = githubSearchQueries.filter((query) => query.lastUsedAt > thresh)
        if (unexpiredQueries.length < githubSearchQueries.length) {
          // TODO change to PG
          // const r = await getRethink()
          // await r
          //   .table('AtlassianAuth')
          //   .get(atlassianAuthId)
          //   .update({
          //     githubSearchQueries: unexpiredQueries
          //   })
          //   .run()
        }
        return unexpiredQueries
      }
    },
    issues: {
      type: new GraphQLNonNull(GitHubIssueConnection),
      description:
        'A list of issues coming straight from the GitHub integration for a specific team member',
      args: {
        first: {
          type: GraphQLInt
        },
        after: {
          type: GraphQLString,
          description: 'a unique cursor id from GitHub'
        },
        queryString: {
          type: GraphQLString,
          description: 'A string of text to search for'
        }
      },
      resolve: async ({teamId, userId, accessToken}, {first, queryString, after}, {authToken}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId || !accessToken) {
          const error = new Error(
            viewerId !== userId
              ? 'Cannot access another team members issues'
              : 'Not integrated with GitHub'
          )
          standardError(error, {tags: {teamId, userId}, userId: viewerId})
          return {error, edges: [], pageInfo: []}
        }
        const manager = new GitHubServerManager(accessToken)
        const searchRes = await manager.searchIssues(queryString, first, after)
        if ('message' in searchRes) {
          console.error(searchRes)
          return {
            error: {message: searchRes.message},
            edges: [],
            pageInfo: {hasNextPage: false, hasPreviousPage: false}
          }
        }
        const {data, errors} = searchRes
        if (Array.isArray(errors)) console.error(errors[0])
        return data.search
      }
    },
    login: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The GitHub login used for queries'
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
