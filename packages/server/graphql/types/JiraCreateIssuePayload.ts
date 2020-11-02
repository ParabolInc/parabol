import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'
import JiraIssue from './JiraIssue'
import {resolveJiraIssue} from '../resolvers'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    jiraIssue: {
      type: JiraIssue,
      description: 'The issue straight from Jira',
      resolve: resolveJiraIssue
    },
    meetingId: {
      type: GraphQLID,
      description: 'The id of the meeting where the Jira issue is being created'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the Jira issue'
    }
  })
})

export default JiraCreateIssuePayload
