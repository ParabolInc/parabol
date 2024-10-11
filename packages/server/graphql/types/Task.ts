import {GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'

const Task: GraphQLObjectType = new GraphQLObjectType({
  name: 'Task',
  fields: {}
})

const {connectionType} = connectionDefinitions({
  name: Task.name,
  nodeType: Task,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const TaskConnection = connectionType
export default Task
