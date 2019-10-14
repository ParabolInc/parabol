import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import StandardMutationError from './StandardMutationError'

const CreateAzureDevopsWorkItemPayload = new GraphQLObjectType({
  name: 'CreateAzureDevopsWorkItemPayload',
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

export default CreateAzureDevopsWorkItemPayload
