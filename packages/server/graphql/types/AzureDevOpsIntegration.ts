import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLString
} from 'graphql'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import {AzureDevOpsAuth} from '../../postgres/queries/getAzureDevOpsAuthsByUserIdTeamId'
import {GQLContext} from '../graphql'
import AzureDevOpsWorkItem from './AzureDevOpsWorkItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {getUserId} from 'parabol-server/utils/authorization'
import standardError from 'parabol-server/utils/standardError'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import {WorkItemQueryResult} from 'parabol-client/utils/AzureDevOpsManager'

const AzureDevOpsIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsIntegration',
  description: 'The Azure DevOps auth + integration helpers for a specific team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Composite key in ado:teamId:userId format',
      resolve: ({teamId, userId}: {teamId: string; userId: string}) => `ado:${teamId}:${userId}`
    },
    isActive: {
      description: 'true if the auth is valid, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    },
    accessToken: {
      description:
        'The access token to Azure DevOps. null if no access token available or the viewer is not the user',
      type: GraphQLID
      // Add resolver
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Azure DevOps account ID'
    },
    instanceIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The Azure DevOps instance IDs that the user has granted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    },
    workItems: {
      type: new GraphQLNonNull(AzureDevOpsWorkItem),
      description:
        'A list of issues coming straight from the jira integration for a specific team member',
      args: {
        id: {
          type: GraphQLID,
          defaultValue: 100
        },
        url: {
          type: GraphQLString,
          description: 'the datetime cursor'
        }
      },
      resolve: async (
        {teamId, userId, accessToken, instanceIds}: AzureDevOpsAuth,
        {id, url},
        {authToken}: GQLContext
      ) => {
        console.log(id)
        console.log(url)
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) {
          const err = new Error('Cannot access another team members issues')
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        const manager = new AzureDevOpsServerManager(accessToken)
        const instanceId = instanceIds[0] as string
        const userStoriesRes = await manager.getUserStories(instanceId)
        const mappedUserStories = (userStoriesRes as WorkItemQueryResult).workItems.map(
          (workItem) => {
            return {
              ...workItem
            }
          }
        )
        return mappedUserStories
      }
    }

    // Add projects
    // Add fields
    // Add search queries
  })
})

export default AzureDevOpsIntegration
