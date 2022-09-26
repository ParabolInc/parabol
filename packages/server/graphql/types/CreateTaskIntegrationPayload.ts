import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

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
