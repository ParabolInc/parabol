import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const CreateGitHubIssuePayload = new GraphQLObjectType({
  name: 'CreateGitHubIssuePayload',
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

export default CreateGitHubIssuePayload
