import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import {resolveNewMeeting} from '../resolvers'
import ActionMeeting from './ActionMeeting'
import Task from './Task'
import Team from './Team'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'

export const EndCheckInSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndCheckInSuccess',
  fields: () => ({
    isKill: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: new GraphQLNonNull(ActionMeeting),
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a check-in meeting, if tried'
    },
    removedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    timelineEvent: {
      type: new GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({meetingId}, _args: unknown, {dataLoader, authToken}) => {
        const viewerId = getUserId(authToken)
        const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
        const timelineEvent = timelineEvents.find(
          (event) => event.type === 'actionComplete' && event.userId === viewerId
        )
        if (!timelineEvent) throw new Error('Timeline event not found')
        return timelineEvent
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
          isValid
        )
        return allUpdatedTasks.filter((task) => {
          return isTaskPrivate(task.tags) ? task.userId === viewerId : true
        })
      }
    }
  })
})

const EndCheckInPayload = makeMutationPayload('EndCheckInPayload', EndCheckInSuccess)

export default EndCheckInPayload
