import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'
import Task from './Task'
import Team from './Team'
import TimelineEvent from './TimelineEvent'

const EndNewMeetingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EndNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    isKill: {
      type: GraphQLBoolean,
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: Team,
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    removedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    timelineEvent: {
      type: TimelineEvent,
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({timelineEventId}, _args: unknown, {dataLoader}) => {
        return await dataLoader.get('timelineEvents').load(timelineEventId)
      }
    },
    updatedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    updatedTasks: {
      type: new GraphQLList(new GraphQLNonNull(Task)),
      description: 'Any tasks that were updated during the meeting',
      resolve: async ({updatedTaskIds}, _args: unknown, {authToken, dataLoader}) => {
        if (!updatedTaskIds) return []
        const viewerId = getUserId(authToken)
        const allUpdatedTasks = (await dataLoader.get('tasks').loadMany(updatedTaskIds)).filter(
          errorFilter
        )
        return allUpdatedTasks.filter((task) => {
          return isTaskPrivate(task.tags) ? task.userId === viewerId : true
        })
      }
    }
  })
})

export default EndNewMeetingPayload
