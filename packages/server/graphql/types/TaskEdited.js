import {GraphQLBoolean, GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import User from './User'

const TaskEdited = new GraphQLObjectType({
  name: 'TaskEdited',
  fields: () => ({
    task: {
      type: Task,
      resolve: resolveTask
    },
    editor: {
      type: User,
      resolve: ({editorUserId}, args, {dataLoader}) => {
        return dataLoader.get('users').load(editorUserId)
      }
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the editor is editing, false if they stopped editing'
    }
  })
})

export default TaskEdited
