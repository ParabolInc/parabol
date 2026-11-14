import {getUserId} from '../../../utils/authorization'
import type {EndTeamHealthSuccessResolvers} from '../resolverTypes'

export type EndTeamHealthSuccessSource = {
  meetingId: string
  teamId: string
}

const EndTeamHealthSuccess: EndTeamHealthSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') throw new Error('Meeting is not a team health')
    return meeting
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'TEAM_HEALTH_COMPLETE' && event.userId === viewerId
    )
    if (!timelineEvent) throw new Error('Timeline event not found')
    return await dataLoader.get('timelineEvents').loadNonNull(timelineEvent.id)
  }
}

export default EndTeamHealthSuccess
