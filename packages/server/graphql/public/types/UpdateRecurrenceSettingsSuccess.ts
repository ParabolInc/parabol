import {UpdateRecurrenceSettingsSuccessResolvers} from '../resolverTypes'

export type UpdateRecurrenceSettingsSuccessSource = {
  meetingId: string
}

const UpdateRecurrenceSettingsSuccess: UpdateRecurrenceSettingsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  }
}

export default UpdateRecurrenceSettingsSuccess
