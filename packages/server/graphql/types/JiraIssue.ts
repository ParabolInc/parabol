import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraIssueId from '../../../client/shared/gqlIds/JiraIssueId'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import JiraRemoteProject from './JiraRemoteProject'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'

const JiraIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraIssue',
  description: 'The Jira Issue that comes direct from Jira',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({cloudId, issueKey}) => !!(cloudId && issueKey),
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID cloudId:issueKey',
      resolve: ({cloudId, issueKey}) => {
        return JiraIssueId.join(cloudId, issueKey)
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
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    cloudName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the jira cloud where the issue lives',
      resolve: async ({cloudId, teamId, userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
      }
    },
    url: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue',
      resolve: async ({cloudId, teamId, userId, issueKey}, _args: unknown, {dataLoader}) => {
        const cloudName = await dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
        return `https://${cloudName}.atlassian.net/browse/${issueKey}`
      }
    },
    issueKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The key of the issue as found in Jira'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The key of the project, which is the prefix to the issueKey',
      resolve: ({issueKey}) => JiraProjectKeyId.join(issueKey)
    },
    project: {
      type: JiraRemoteProject,
      description: 'The project fetched from jira',
      resolve: async ({issueKey, teamId, userId, cloudId}, _args: unknown, {dataLoader}) => {
        const projectKey = JiraProjectKeyId.join(issueKey)
        const jiraRemoteProjectRes = await dataLoader
          .get('jiraRemoteProject')
          .load({cloudId, projectKey, teamId, userId})
        return {
          ...jiraRemoteProjectRes,
          service: 'jira',
          cloudId,
          userId,
          teamId
        }
      }
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
    possibleEstimationFieldNames: {
      // The field is computed in the atlassian data loader
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'Field names that exists on the issue and can be used as estimation fields'
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The stringified ADF of the jira issue description',
      resolve: ({description}) => (description ? JSON.stringify(description) : '')
    },
    descriptionHTML: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: JiraIssue.name,
  nodeType: JiraIssue,
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

export const JiraIssueConnection = connectionType
export const JiraIssueEdge = edgeType
export default JiraIssue
