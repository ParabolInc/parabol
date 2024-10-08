import {UpdateMeetingTemplateSuccessResolvers} from '../resolverTypes'

export type UpdateMeetingTemplateSuccessSource = {
  meetingId: string
}

const UpdateMeetingTemplateSuccess: UpdateMeetingTemplateSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  }
}

export default UpdateMeetingTemplateSuccess
