import {GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'

const Comment = new GraphQLObjectType({
  name: 'Comment',
  fields: {}
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Comment.name,
  nodeType: Comment,
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
export const TaskEdge = edgeType
export default Comment
