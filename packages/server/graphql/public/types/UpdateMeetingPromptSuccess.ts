import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {UpdateMeetingPromptSuccessResolvers} from '../resolverTypes'

export type UpdateMeetingPromptSuccessSource = {
  meetingId: string
}

const UpdateMeetingPromptSuccess: UpdateMeetingPromptSuccessResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingTeamPrompt>
  }
}

export default UpdateMeetingPromptSuccess
