import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {UpsertTeamPromptResponsePayloadResolvers} from '../resolverTypes'

export type UpsertTeamPromptResponsePayloadSource = {
  teamPromptResponseId: number
  meetingId: string
}

const UpsertTeamPromptResponsePayload: UpsertTeamPromptResponsePayloadResolvers = {
  teamPromptResponse: async ({teamPromptResponseId}, _args, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  }
}

export default UpsertTeamPromptResponsePayload
