import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {EndTeamPromptSuccessResolvers} from '../resolverTypes'

export type EndTeamPromptSuccessSource = {
  meetingId: string
  teamId: string
  timelineEventId: string
}

const EndTeamPromptSuccess: EndTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').load(meetingId)) as MeetingTeamPrompt
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  timelineEvent: async ({timelineEventId}, _args, {dataLoader}) => {
    const res = await dataLoader.get('timelineEvents').loadNonNull(timelineEventId)
    return res as typeof res & {type: 'TEAM_PROMPT_COMPLETE'}
  }
}

export default EndTeamPromptSuccess
