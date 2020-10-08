import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {JiraIssueConnection} from './JiraIssue'
import JiraRemoteProject from './JiraRemoteProject'

const AtlassianIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'AtlassianIntegration',
  description: 'The atlassian auth + integration helpers for a specific team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    isActive: {
      description: 'true if the auth is valid, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    },
    accessToken: {
      description:
        'The access token to atlassian, useful for 1 hour. null if no access token available or the viewer is not the user',
      type: GraphQLID,
      resolve: async ({accessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The atlassian account ID'
    },
    cloudIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The atlassian cloud IDs that the user has granted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
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
    },
    issues: {
      type: new GraphQLNonNull(JiraIssueConnection),
      description:
        'A list of issues coming straight from the jira integration for a specific team member',
      args: {
        first: {
          type: GraphQLInt,
          defaultValue: 100
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        },
        queryString: {
          type: GraphQLString,
          description: 'A string of text to search for, or JQL if isJQL is true'
        },
        isJQL: {
          type: GraphQLNonNull(GraphQLBoolean),
          description: 'true if the queryString is JQL, else false'
        },
        projectKeyFilters: {
          type: GraphQLList(GraphQLNonNull(GraphQLID)),
          descrption:
            'A list of projects to restrict the search to. format is cloudId:projectKey. If null, will search all'
        }
      },
      resolve: async (
        {teamId, userId, accessToken, cloudIds},
        {first, queryString, isJQL, projectKeyFilters},
        {authToken}
      ) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) {
          const err = new Error('Cannot access another team members issues')
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        if (!accessToken) {
          const err = new Error('Not integrated with Jira')
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        const manager = new AtlassianServerManager(accessToken)
        const projectKeyFiltersByCloudId = {}
        if (projectKeyFilters?.length > 0) {
          projectKeyFilters.forEach((globalProjectKey) => {
            const [cloudId, projectKey] = globalProjectKey.split(':')
            projectKeyFiltersByCloudId[cloudId] = projectKeyFiltersByCloudId[cloudId] || []
            projectKeyFiltersByCloudId[cloudId].push(projectKey)
          })
        } else {
          cloudIds.forEach((cloudId) => {
            projectKeyFiltersByCloudId[cloudId] = []
          })
        }

        const issueRes = await manager.getIssues(queryString, isJQL, projectKeyFiltersByCloudId)
        const {error, issues} = issueRes
        const mappedIssues = issues.map((issue) => ({
          ...issue,
          updatedAt: new Date()
        }))
        return connectionFromTasks(mappedIssues, first, error || undefined)
      }
    },
    projects: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(JiraRemoteProject))),
      description:
        'A list of projects accessible by this team member. empty if viewer is not the user',
      resolve: async ({accessToken, cloudIds, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return []
        const manager = new AtlassianServerManager(accessToken)
        const projects = await manager.getAllProjects(cloudIds)
        return projects
      }
    }
  })
})

export default AtlassianIntegration
