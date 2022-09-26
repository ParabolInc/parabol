import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import {getUserId} from '../../utils/authorization'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import resolveReactjis from '../resolvers/resolveReactjis'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import Reactable, {reactableFields} from './Reactable'
import Reactji from './Reactji'
import Threadable, {threadableFields} from './Threadable'

const TOMBSTONE = convertToTaskContent('[deleted]')

const Comment = new GraphQLObjectType<any, GQLContext>({
  name: 'Comment',
  description: 'A comment on a thread',
  interfaces: () => [Reactable, Threadable],
  fields: () => ({
    ...threadableFields(),
    ...reactableFields(),
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The rich text body of the item, if inactive, a tombstone text',
      resolve: ({isActive, content}) => {
        return isActive ? content : TOMBSTONE
      }
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
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
      resolve: ({createdBy, isActive, isAnonymous}, _args: unknown, {dataLoader}: GQLContext) => {
        return isAnonymous || !isActive ? null : dataLoader.get('users').load(createdBy)
      }
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    isAnonymous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the comment is anonymous, else false',
      resolve: ({isAnonymous}) => !!isAnonymous
    },
    isViewerComment: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer wrote this comment, else false',
      resolve: ({createdBy, isActive}, _args: unknown, {authToken}) => {
        const viewerId = getUserId(authToken)
        return isActive ? viewerId === createdBy : false
      }
    },
    reactjis: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Reactji))),
      description: 'All the reactjis for the given reflection',
      resolve: (source, args, context) => {
        const {isActive} = source
        return isActive ? resolveReactjis(source, args, context) : []
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
