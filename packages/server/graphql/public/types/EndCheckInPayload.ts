import {GraphQLError} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {EndCheckInPayloadResolvers} from '../resolverTypes'

export type EndCheckInPayloadSource = {
  meetingId: string
  teamId: string
  isKill: boolean
  updatedTaskIds: string[]
  removedTaskIds: string[]
  removedSuggestedActionId?: string
}

const EndCheckInPayload: EndCheckInPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'actionComplete' && event.userId === viewerId
    )
    if (!timelineEvent)
      throw new GraphQLError('Timeline event not found', {extensions: {code: 'NOT_FOUND'}})
    return timelineEvent
  },
  updatedTasks: async ({updatedTaskIds}, _args, {dataLoader, authToken}) => {
    if (!updatedTaskIds) return []
    const viewerId = getUserId(authToken)
    const allUpdatedTasks = (await dataLoader.get('tasks').loadMany(updatedTaskIds)).filter(isValid)
    return allUpdatedTasks.filter((task) => {
      return isTaskPrivate(task.tags) ? task.userId === viewerId : true
    })
  }
}

export default EndCheckInPayload
