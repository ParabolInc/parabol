import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import isTaskPrivate from 'parabol-client/lib/utils/isTaskPrivate'
import Comment from '../../database/types/Comment'
import TaskDB from '../../database/types/Task'
import {Threadable} from '../../database/types/Threadable'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveForSU} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import RetroPhaseItem from './RetroPhaseItem'
import RetroReflection from './RetroReflection'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Task from './Task'
import Team from './Team'
import {ThreadableConnection} from './Threadable'

const RetroReflectionGroup = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroReflectionGroup',
  description: 'A reflection created during the reflect phase of a retrospective',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the meeting was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the group has not been removed, else false'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its meeting'
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    phaseItem: {
      type: new GraphQLNonNull(RetroPhaseItem),
      resolve: ({retroPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(retroPhaseItemId)
      }
    },
    reflections: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
      resolve: async ({id: reflectionGroupId, meetingId}, _args, {dataLoader}) => {
        // use meetingId so we only hit the DB once instead of once per group
        const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
        const filteredReflections = reflections.filter(
          (reflection) => reflection.reflectionGroupId === reflectionGroupId
        )
        filteredReflections.sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
        return filteredReflections
      }
    },
    retroPhaseItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its phaseItem. Immutable.'
    },
    smartTitle: {
      type: GraphQLString,
      description: 'Our auto-suggested title, to be compared to the actual title for analytics',
      resolve: resolveForSU('smartTitle')
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the reflection group in the phase item'
    },
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks created for this group in the discussion phase',
      resolve: async ({id: reflectionGroupId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const tasks = await dataLoader.get('tasksByThreadId').load(reflectionGroupId)
        return tasks.filter((task) => {
          if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
          return true
        })
      }
    },
    team: {
      type: Team,
      description: 'The team that is running the retro',
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return dataLoader.get('teams').load(meeting.teamId)
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
            ;(threadable as any).replies = replies
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
    },
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective reflections'
    },
    titleIsUserDefined: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if a user wrote the title, else false',
      resolve: ({title, smartTitle}) => {
        return title ? title !== smartTitle : false
      }
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was updated at'
    },
    voterIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'A list of voterIds (userIds). Not available to team to preserve anonymity',
      resolve: resolveForSU('voterIds')
    },
    voteCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of votes this group has received',
      resolve: ({voterIds}) => {
        return voterIds ? voterIds.length : 0
      }
    },
    viewerVoteCount: {
      type: GraphQLInt,
      description: 'The number of votes the viewer has given this group',
      resolve: ({voterIds}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return voterIds
          ? voterIds.reduce((sum, voterId) => (voterId === viewerId ? sum + 1 : sum), 0)
          : 0
      }
    }
  })
})

export default RetroReflectionGroup
