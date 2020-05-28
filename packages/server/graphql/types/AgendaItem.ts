import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import TeamMember from './TeamMember'
import {IAgendaItem} from 'parabol-client/types/graphql'

import {Threadable} from '../../database/types/Threadable'
import {ThreadableConnection} from './Threadable'
import TaskDB from '../../database/types/Task'

const AgendaItem = new GraphQLObjectType<IAgendaItem, GQLContext>({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique agenda item id teamId::shortid'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The body of the agenda item'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the agenda item in the list'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team for this agenda item'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId that created this agenda item'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was updated'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that created the agenda item',
      resolve: async ({teamMemberId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    thread: {
      type: GraphQLNonNull(ThreadableConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLString,
          description: 'the incrementing sort order in string format'
        }
      },
      description: 'the comments and tasks created from the discussion',
      resolve: async ({id: reflectionGroupId}, _args, {dataLoader}) => {
        const [comments, tasks] = await Promise.all([
          dataLoader.get('commentsByThreadId').load(reflectionGroupId),
          dataLoader.get('tasksByThreadId').load(reflectionGroupId)
        ])
        // type Item = IThreadable & {threadSortOrder: NonNullable<number>}
        const threadables = [...comments, ...tasks] as Threadable[]
        const threadablesByParentId = {} as {[parentId: string]: Threadable[]}

        const rootThreadables = [] as Threadable[]
        const filteredThreadables = [] as Threadable[]

        threadables.forEach((threadable) => {
          const {threadParentId} = threadable
          if (!threadParentId) {
            rootThreadables.push(threadable)
          } else if ((threadable as TaskDB).status || (threadable as Comment).isActive) {
            // if it's a task or it's a non-deleted comment, add it
            threadablesByParentId[threadParentId] = threadablesByParentId[threadParentId] || []
            threadablesByParentId[threadParentId].push(threadable)
          }
        })

        rootThreadables.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
        rootThreadables.forEach((threadable) => {
          const {id: threadableId} = threadable
          const replies = threadablesByParentId[threadableId]
          const isActive = (threadable as TaskDB).status || (threadable as Comment).isActive
          if (!isActive && !replies) return
          filteredThreadables.push(threadable)
          if (replies) {
            replies.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
              ; (threadable as any).replies = replies
          }
        })

        const edges = filteredThreadables.map((node) => ({
          cursor: node.createdAt,
          node
        }))

        const lastEdge = edges[edges.length - 1]
        return {
          edges,
          pageInfo: {
            endCursor: lastEdge?.cursor,
            hasNextPage: false
          }
        }
      }
    }
  })
})

export default AgendaItem
