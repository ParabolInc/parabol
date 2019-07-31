import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'

const TaskUpdated = new GraphQLObjectType({
  name: 'TaskUpdated',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default TaskUpdated
