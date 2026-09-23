import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {UpsertTeamPromptResponseSuccessResolvers} from '../resolverTypes'

export type UpsertTeamPromptResponseSuccessSource = {
  teamPromptResponseId: number
  meetingId: string
}

const UpsertTeamPromptResponseSuccess: UpsertTeamPromptResponseSuccessResolvers = {
  teamPromptResponse: async ({teamPromptResponseId}, _args, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  }
}

export default UpsertTeamPromptResponseSuccess
