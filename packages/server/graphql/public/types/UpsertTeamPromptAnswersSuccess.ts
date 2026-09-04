import type {UpsertTeamPromptAnswersSuccessResolvers} from '../resolverTypes'

export type UpsertTeamPromptAnswersSuccessSource = {
  meetingId: string
  responseId: number
}

const UpsertTeamPromptAnswersSuccess: UpsertTeamPromptAnswersSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Not a team prompt meeting')
    return meeting
  },
  response: ({responseId}, _args, {dataLoader}) => {
    return dataLoader.get('teamPromptResponses').loadNonNull(responseId)
  }
}

export default UpsertTeamPromptAnswersSuccess
