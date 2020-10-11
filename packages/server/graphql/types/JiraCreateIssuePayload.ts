import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    key: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The key used to identify the issue in Jira'
    },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The content of the Jira issue'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the Jira issue'
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the issue that lives in Jira',
      resolve: ({cloudName, key}) => {
        return `https://${cloudName}.atlassian.net/browse/${key}`
      }
    }
  })
})

export default JiraCreateIssuePayload
