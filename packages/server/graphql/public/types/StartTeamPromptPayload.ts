import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {StartTeamPromptPayloadResolvers} from '../resolverTypes'

export type StartTeamPromptPayloadSource = {
  meetingId: string | null
  meetingSeriesId?: number | null
  teamId: string
  hasGcalError?: boolean
}

const StartTeamPromptPayload: StartTeamPromptPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    if (!meetingId) return null
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  },
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null
    return (await dataLoader.get('meetingSeries').load(meetingSeriesId)) ?? null
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartTeamPromptPayload
