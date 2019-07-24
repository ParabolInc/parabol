import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'

const TaskAdded = new GraphQLObjectType({
  name: 'TaskAdded',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default TaskAdded
