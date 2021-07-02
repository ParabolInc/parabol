import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import IntegrationHashId from '../../../client/shared/gqlIds/IntegrationHashId'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import JiraRemoteProject from './JiraRemoteProject'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import Story, {storyFields} from './Story'
import TaskIntegration from './TaskIntegration'

const JiraIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraIssue',
  description: 'The Jira Issue that comes direct from Jira',
  interfaces: () => [Story, TaskIntegration],
  isTypeOf: ({cloudId, issueKey}) => !!(cloudId && issueKey),
  fields: () => ({
    ...storyFields(),
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'jira:cloudId:issueKey. equal to Task.integrationHash',
      resolve: ({cloudId, issueKey}) => {
        return IntegrationHashId.join('jira', cloudId, issueKey)
      }
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    cloudName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The name of the jira cloud where the issue lives',
      resolve: async ({cloudId, teamId, userId}, _args, {dataLoader}) => {
        return dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
      }
    },
    url: {
      type: GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue',
      resolve: async ({cloudId, teamId, userId, issueKey}, _args, {dataLoader}) => {
        const cloudName = await dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
        return `https://${cloudName}.atlassian.net/browse/${issueKey}`
      }
    },
    issueKey: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The key of the issue as found in Jira'
    },
    projectKey: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The key of the project, which is the prefix to the issueKey',
      resolve: ({issueKey}) => JiraProjectKeyId.join(issueKey)
    },
    project: {
      type: JiraRemoteProject,
      description: 'The project fetched from jira',
      resolve: async ({issueKey, teamId, userId, cloudId}, _args, {dataLoader}) => {
        const projectKey = JiraProjectKeyId.join(issueKey)
        return dataLoader.get('jiraRemoteProject').load({cloudId, projectKey, teamId, userId})
      }
    },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Alias for summary used by the Story interface',
      resolve: ({summary}) => {
        return summary
      }
    },
    description: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The stringified ADF of the jira issue description',
      resolve: ({description}) => (description ? JSON.stringify(description) : '')
    },
    descriptionHTML: {
      type: GraphQLNonNull(GraphQLString),
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
