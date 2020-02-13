import {GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLBoolean} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import Reactji from './Reactji'
import Threadable, {threadableFields} from './Threadable'
import {getUserId} from '../../utils/authorization'
import getGroupedReactjis from '../../utils/getGroupedReactjis'

const Comment = new GraphQLObjectType<any, GQLContext, any>({
  name: 'Comment',
  description: 'A comment on a thread',
  interfaces: () => [Threadable],
  fields: () => ({
    ...threadableFields(),
    isActive: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    reactjis: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Reactji))),
      description: 'All the reactjis for the given reflection',
      resolve: ({reactjis, id: commentId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return getGroupedReactjis(reactjis, viewerId, commentId)
      }
    }
  })
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
