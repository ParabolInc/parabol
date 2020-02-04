import {GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'

const TaskRemoved = new GraphQLObjectType<any, GQLContext>({
  name: 'TaskRemoved',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    }
  })
})

export default TaskRemoved
