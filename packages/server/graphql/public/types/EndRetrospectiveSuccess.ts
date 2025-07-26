import {getUserId} from '../../../utils/authorization'
import {EndRetrospectiveSuccessResolvers} from '../resolverTypes'

export type EndRetrospectiveSuccessSource = {
  gotoPageSummary: boolean
  meetingId: string
  teamId: string
  isKill: boolean
  removedTaskIds: string[]
}

const EndRetrospectiveSuccess: EndRetrospectiveSuccessResolvers = {
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
      (event) => event.type === 'retroComplete' && event.userId === viewerId
    )
    if (!timelineEvent) throw new Error('Timeline event not found')
    return timelineEvent as typeof timelineEvent & {meetingId: string}
  }
}

export default EndRetrospectiveSuccess
