import {GraphQLObjectType} from 'graphql'
import {resolveTask} from 'server/graphql/resolvers'
import Task from 'server/graphql/types/Task'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const CreateJiraIssuePayload = new GraphQLObjectType({
  name: 'CreateJiraIssuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default CreateJiraIssuePayload
