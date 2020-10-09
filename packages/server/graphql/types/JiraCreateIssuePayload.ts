import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const JiraCreateIssuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraCreateIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({cloudId, key}) => {
        return `${cloudId}:${key}`
      }
    },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The content of the Jira issue'
    },
    url: {
      // TODO: change this to same format as JiraIssue type
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the issue that lives in Jira'
    }
  })
})

export default JiraCreateIssuePayload
