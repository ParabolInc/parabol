import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'

const AzureDevOpsWorkItem = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsWorkItem',
  description: 'The Azure DevOps Issue that comes direct from Azure DevOps',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({service}) => service === 'azureDevOps',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID instanceId:issueKey'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Title of the work item'
    },
    teamProject: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the Team Project the work item belongs to'
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
