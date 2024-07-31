import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import {ThreadableSource as ThreadableDB} from '../public/types/Threadable'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfo from './PageInfo'

export const threadableFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the item was created'
  },
  createdBy: {
    type: GraphQLID,
    description: 'The userId that created the item'
  },
  createdByUser: {
    type: require('./User').default,
    description: 'The user that created the item',
    resolve: ({createdBy}: {createdBy: string}, _args: unknown, {dataLoader}: GQLContext) => {
      return dataLoader.get('users').load(createdBy)
    }
  },
  replies: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Threadable))),
    description: 'the replies to this threadable item',
    resolve: ({replies}: {replies: ThreadableDB[]}) => replies || []
  },
  discussionId: {
    type: GraphQLID,
    description:
      'The FK of the discussion this task was created in. Null if task was not created in a discussion',
    // can remove the threadId after 2021-07-01
    resolve: ({discussionId, threadId}: {discussionId: string; threadId: string}) =>
      discussionId || threadId
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
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the item was updated'
  }
})

const Threadable: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'Threadable',
  fields: {}
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Threadable.name,
  nodeType: Threadable,
  edgeFields: () => ({
    cursor: {
      type: GraphQLString
    }
  }),
  connectionFields: () => ({
    error: {
      type: GraphQLString,
      description: 'Any errors that prevented the query from returning the full results'
    },
    pageInfo: {
      type: PageInfo,
      description: 'Page info with strings (sortOrder) as cursors'
    }
  })
})

export const ThreadableConnection = connectionType
export const ThreadableEdge = edgeType
export default Threadable
