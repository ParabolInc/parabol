import {getUserId} from '../../../utils/authorization'
import {EndTeamPromptSuccessResolvers} from '../resolverTypes'

export type EndTeamPromptSuccessSource = {
  meetingId: string
  teamId: string
}

const EndTeamPromptSuccess: EndTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Meeting is not a team prompt')
    return meeting
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
