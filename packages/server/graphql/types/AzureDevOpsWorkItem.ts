import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import {getInstanceId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import AzureDevOpsRemoteProject from './AzureDevOpsRemoteProject'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'

const AzureDevOpsWorkItem = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsWorkItem',
  description: 'The Azure DevOps Work Item that comes direct from Azure DevOps',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({service}) => service === 'azureDevOps',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID instanceId:projectKey:issueKey',
      resolve: ({id, teamProject, url}: {id: string; teamProject: string; url: string}) => {
        const instanceId = getInstanceId(url)
        return AzureDevOpsIssueId.join(instanceId, teamProject, id)
      }
    },
    issueKey: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the issue from Azure, e.g. 7',
      resolve: async ({id}: {id: string}) => {
        const {issueKey} = AzureDevOpsIssueId.split(id)
        return issueKey
      }
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Title of the work item'
    },
    // TODO: change teamProject name: https://github.com/ParabolInc/parabol/issues/7073
    teamProject: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name or id of the Team Project the work item belongs to'
    },
    project: {
      type: new GraphQLNonNull(AzureDevOpsRemoteProject),
      description: 'The Azure DevOps Remote Project the work item belongs to',
      resolve: async (
        {
          teamId,
          userId,
          teamProject,
          url
        }: {teamId: string; userId: string; teamProject: string; url: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        const instanceId = getInstanceId(url)
        return dataLoader
          .get('azureDevOpsProject')
          .load({instanceId, projectId: teamProject, userId, teamId})
      }
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'URL to the issue'
    },
    state: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The Current State of the Work item'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The Type of the Work item'
    },
    descriptionHTML: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: AzureDevOpsWorkItem.name,
  nodeType: AzureDevOpsWorkItem,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    },
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const AzureDevOpsWorkItemConnection = connectionType
export const AzureDevOpsWorkItemEdge = edgeType
export default AzureDevOpsWorkItem
