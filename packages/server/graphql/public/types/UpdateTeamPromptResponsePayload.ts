import {UpdateTeamPromptResponsePayloadResolvers} from '../resolverTypes'

export type UpdateTeamPromptResponsePayloadSource =
  | {
      teamPromptResponseId: number
      meetingId: string
    }
  | {error: {message: string}}

const UpdateTeamPromptResponsePayload: UpdateTeamPromptResponsePayloadResolvers = {
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

export default UpdateTeamPromptResponsePayload
