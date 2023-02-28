import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {UpdateRecurrenceSettingsSuccessResolvers} from '../resolverTypes'

export type UpdateRecurrenceSettingsSuccessSource = {
  meetingId: string
}

const UpdateRecurrenceSettingsSuccess: UpdateRecurrenceSettingsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingTeamPrompt>
  }
}

export default UpdateRecurrenceSettingsSuccess
