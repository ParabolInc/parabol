import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

const ChangeTaskTeamPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ChangeTaskTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    removedTaskId: {
      type: GraphQLID,
      description:
        'the taskId sent to a user who is not on the new team so they can remove it from their client',
      resolve: async ({taskId}) => {
        return taskId
      }
    }
  })
})

export default ChangeTaskTeamPayload
