import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const JiraIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraIssue',
  description: 'The Jira Issue that comes direct from Jira',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({cloudId, issueKey}) => {
        return `JiraIssue:${cloudId}:${issueKey}`
      }
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    issueKey: {
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

export default JiraIssue
