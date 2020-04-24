import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const CreateJiraIssuePayload = new GraphQLObjectType<any, GQLContext>({
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
