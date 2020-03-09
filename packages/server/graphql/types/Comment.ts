import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import Reactable, {reactableFields} from './Reactable'
import Reactji from './Reactji'
import Threadable, {threadableFields} from './Threadable'
import resolveReactjis from '../resolvers/resolveReactjis'

const Comment = new GraphQLObjectType<any, GQLContext, any>({
  name: 'Comment',
  description: 'A comment on a thread',
  interfaces: () => [Reactable, Threadable],
  fields: () => ({
    ...threadableFields(),
    ...reactableFields(),
    createdAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the item was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the item, null if anonymous',
      resolve: ({createdBy, isAnonymous}) => {
        return isAnonymous ? null : createdBy
      }
    },
    createdByUser: {
      type: require('./User').default,
      description: 'The user that created the item, null if anonymous',
      resolve: ({createdBy, isAnonymous}, _args, {dataLoader}: GQLContext) => {
        return isAnonymous ? null : dataLoader.get('users').load(createdBy)
      }
    },
    isActive: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    isAnonymous: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the comment is anonymous, else false',
      resolve: ({isAnonymous}) => !!isAnonymous
    },
    isViewerComment: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer wrote this comment, else false',
      resolve: ({createdBy}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === createdBy
      }
    },
    reactjis: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Reactji))),
      description: 'All the reactjis for the given reflection',
      resolve: resolveReactjis
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
