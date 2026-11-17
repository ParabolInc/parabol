import type {UpdateMeetingTemplatePayloadResolvers} from '../resolverTypes'

export type UpdateMeetingTemplatePayloadSource = {
  meetingId: string
}

const UpdateMeetingTemplatePayload: UpdateMeetingTemplatePayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  }
}

export default UpdateMeetingTemplatePayload
