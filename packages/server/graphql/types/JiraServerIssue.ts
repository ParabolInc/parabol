import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import TaskIntegration from './TaskIntegration'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {JiraServerRestProject} from '../../integrations/jiraServer/JiraServerRestManager'

const JiraServerIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraServerIssue',
  description: 'The Jira Issue that comes direct from Jira Server',
  interfaces: () => [TaskIntegration],
  isTypeOf: ({service}) => service === 'jiraServer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'GUID providerId:repositoryId:issueId',
      resolve: ({
        id,
        project,
        providerId
      }: {
        id: string
        project: JiraServerRestProject
        providerId: number
      }) => {
        return JiraServerIssueId.join(providerId, project.id, id)
      }
    },
    issueKey: {
      type: new GraphQLNonNull(GraphQLID)
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({project}) => project.key
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol teamId this issue was fetched for'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parabol userId this issue was fetched for'
    },
    url: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue',
      resolve: ({issueKey, self}) => {
        const {origin} = new URL(self)
        return `${origin}/browse/${issueKey}`
      }
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    descriptionHTML: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: JiraServerIssue.name,
  nodeType: JiraServerIssue,
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

export const JiraServerIssueConnection = connectionType
export const JiraServerIssueEdge = edgeType
export default JiraServerIssue
