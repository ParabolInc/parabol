import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLList} from 'graphql'
import AzureDevOpsIssueId from '../../../client/shared/gqlIds/AzureDevOpsIssueId'
import AzureDevOpsProjectKeyId from '../../../client/shared/gqlIds/AzureDevOpsProjectKeyId'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
//import GraphQLURLType from './GraphQLURLType'
//import AzureDevOpsRemoteProject from './AzureDevOpsRemoteProject'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'

const AzureDevOpsIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsIssue',
  description: 'The Azure DevOps Issue that comes direct from Azure DevOps',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({instanceId, issueKey}) => !!(instanceId && issueKey),
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID instanceId:issueKey',
      resolve: ({instanceId, issueKey}) => {
        return AzureDevOpsIssueId.join(instanceId, issueKey)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    instanceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the Azure DevOps tenant where the issue lives'
    },
    issueKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The key of the issue as found in Jira'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The key of the project, which is the prefix to the issueKey',
      resolve: ({issueKey}) => AzureDevOpsProjectKeyId.join(issueKey)
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the Azure DevOps issue'
    },
    possibleEstimationFieldNames: {
      // The field is computed in the azuredevops data loader
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'Field names that exists on the issue and can be used as estimation fields'
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The stringified ADF of the Azure DevOps issue description',
      resolve: ({description}) => (description ? JSON.stringify(description) : '')
    },
    descriptionHTML: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: AzureDevOpsIssue.name,
  nodeType: AzureDevOpsIssue,
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

export const AzureDevOpsIssueConnection = connectionType
export const AzureDevOpsIssueEdge = edgeType
export default AzureDevOpsIssue
