import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const CreateTaskIntegrationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateTaskIntegrationPayload',
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

export default CreateTaskIntegrationPayload
