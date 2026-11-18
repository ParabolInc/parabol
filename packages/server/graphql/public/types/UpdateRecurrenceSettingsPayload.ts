import type {UpdateRecurrenceSettingsPayloadResolvers} from '../resolverTypes'

export type UpdateRecurrenceSettingsPayloadSource = {
  meetingId: string
}

const UpdateRecurrenceSettingsPayload: UpdateRecurrenceSettingsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  }
}

export default UpdateRecurrenceSettingsPayload
