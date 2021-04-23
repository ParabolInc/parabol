import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'

const GitHubIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubIssue',
  description: 'The GitHub Issue that comes direct from GitHub',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the issue as found in GitHub'
    },
    url: {
      type: GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue'
    },
    nameWithOwner: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The owner / repo of the issue as found in GitHub'
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The title of the GitHub issue'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: GitHubIssue.name,
  nodeType: GitHubIssue,
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

export const GitHubIssueConnection = connectionType
export const GitHubIssueEdge = edgeType
export default GitHubIssue
