import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList
} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import ThreadSourceEnum from './ThreadSourceEnum'
import Task from './Task'
import Comment from './Comment'

export const threadableFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  content: {
    type: GraphQLNonNull(GraphQLString),
    description: 'The rich text body of the item'
  },
  createdAt: {
    type: GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the item was created'
  },
  createdBy: {
    type: GraphQLID,
    description: 'The userId that created the item'
  },
  createdByUser: {
    type: require('./User').default,
    description: 'The user that created the item',
    resolve: ({createdBy}, _args, {dataLoader}: GQLContext) => {
      return dataLoader.get('users').load(createdBy)
    }
  },
  replies: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(Threadable))),
    description: 'the replies to this threadable item',
    resolve: ({replies}) => replies || []
  },
  threadId: {
    type: GraphQLID,
    description: 'The ID of the thread'
  },
  threadSource: {
    type: ThreadSourceEnum,
    description: 'The item that spurred the threaded discussion'
  },
  threadParentId: {
    type: GraphQLID,
    description: 'the parent, if this threadable is a reply, else null'
  },
  threadSortOrder: {
    type: GraphQLFloat,
    description: 'the order of this threadable, relative to threadParentId'
  },
  updatedAt: {
    type: GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the item was updated'
  }
})

const Threadable = new GraphQLInterfaceType({
  name: 'Threadable',
  description: 'An item that can be put in a thread',
  fields: threadableFields,
  resolveType: ({status}) => {
    return status ? Task : Comment
  }
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Threadable.name,
  nodeType: Threadable,
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

export const ThreadableConnection = connectionType
export const ThreadableEdge = edgeType
export default Threadable
