import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import type {EndTeamPromptSuccessResolvers} from '../resolverTypes'

export type EndTeamPromptSuccessSource = {
  meetingId: string
  teamId: string
}

const EndTeamPromptSuccess: EndTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'TEAM_PROMPT_COMPLETE' && event.userId === viewerId
    )
    if (!timelineEvent) throw new Error('Timeline event not found')
    return await dataLoader.get('timelineEvents').loadNonNull(timelineEvent.id)
  }
}

export default EndTeamPromptSuccess
