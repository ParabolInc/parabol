import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const GitHubCreateIssueSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubCreateIssueSuccess',
  fields: () => ({
    gitHubIssueId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the issue from GitHub'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the GitHub issue is being created'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the GitHub issue'
    }
  })
})

const GitHubCreateIssuePayload = makeMutationPayload(
  'GitHubCreateIssuePayload',
  GitHubCreateIssueSuccess
)

export default GitHubCreateIssuePayload
