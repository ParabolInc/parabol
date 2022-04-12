import {UpsertTeamPromptResponsePayloadResolvers} from '../resolverTypes'

export type UpsertTeamPromptResponsePayloadSource =
  | {
      teamPromptResponseId: number
      meetingId: string
    }
  | {error: {message: string}}

const UpsertTeamPromptResponsePayload: UpsertTeamPromptResponsePayloadResolvers = {
  teamPromptResponse: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamPromptResponseId} = source
    return dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
  },
  meeting: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default UpsertTeamPromptResponsePayload
