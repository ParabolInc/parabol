import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {EndCheckInSuccessResolvers} from '../resolverTypes'

export type EndCheckInSuccessSource = {
  meetingId: string
  teamId: string
  isKill: boolean
  updatedTaskIds: string[]
  removedTaskIds: string[]
  removedSuggestedActionId?: string
}

const EndCheckInSuccess: EndCheckInSuccessResolvers = {
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
    if (!timelineEvent) throw new Error('Timeline event not found')
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

export default EndCheckInSuccess
