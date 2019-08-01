import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'

const TaskRemoved = new GraphQLObjectType({
  name: 'TaskRemoved',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default TaskRemoved
