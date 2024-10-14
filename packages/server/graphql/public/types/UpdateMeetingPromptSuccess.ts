import {UpdateMeetingPromptSuccessResolvers} from '../resolverTypes'

export type UpdateMeetingPromptSuccessSource = {
  meetingId: string
}

const UpdateMeetingPromptSuccess: UpdateMeetingPromptSuccessResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Not a team prompt meeting')
    return meeting
  }
}

export default UpdateMeetingPromptSuccess
