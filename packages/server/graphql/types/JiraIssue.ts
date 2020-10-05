import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'

const JiraIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraIssue',
  description: 'The Jira Issue that comes direct from Jira',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({cloudId, key}) => {
        return `${cloudId}:${key}`
      }
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    cloudName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The name of the jira cloud where the issue lives'
    },
    url: {
      type: GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue',
      resolve: ({cloudName, key}) => {
        return `https://${cloudName}.atlassian.net/browse/${key}`
      }
    },
    key: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The key of the issue as found in Jira'
    },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
    description: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The plaintext description of the jira issue'
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
