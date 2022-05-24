import {Maybe, ResolversTypes, UpdateMeetingPromptSuccessResolvers} from '../resolverTypes'

export type UpdateMeetingPromptSuccessSource = {
  meetingId: string
}

const UpdateMeetingPromptSuccess: UpdateMeetingPromptSuccessResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return (meeting.meetingType !== 'teamPrompt' ? null : meeting) as Maybe<
      ResolversTypes['TeamPromptMeeting']
    >
  }
}

export default UpdateMeetingPromptSuccess
