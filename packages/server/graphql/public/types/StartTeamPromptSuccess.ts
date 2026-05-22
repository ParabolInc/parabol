import type {StartTeamPromptSuccessResolvers} from '../resolverTypes'

export type StartTeamPromptSuccessSource = {
  meetingId: string | null
  meetingSeriesId?: number | null
  teamId: string
}

const StartTeamPromptSuccess: StartTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    if (!meetingId) return null
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Not a team prompt meeting')
    return meeting
  },
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null
    return (await dataLoader.get('meetingSeries').load(meetingSeriesId)) ?? null
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartTeamPromptSuccess
