import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    cloudName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the jira cloud where the issue lives'
    },
    key: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The key of the issue as found in Jira'
    },
    meetingId: {
      type: GraphQLID,
      description: 'The id of the meeting where the Jira issue is being created'
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
