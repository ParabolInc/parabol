import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const GitHubCreateIssueSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubCreateIssueSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the GitHub issue is being created'
    }
  })
})

const GitHubCreateIssuePayload = makeMutationPayload(
  'GitHubCreateIssuePayload',
  GitHubCreateIssueSuccess
)

export default GitHubCreateIssuePayload
