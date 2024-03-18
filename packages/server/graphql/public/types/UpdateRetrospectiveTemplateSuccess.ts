import {UpdateRetrospectiveTemplateSuccessResolvers} from '../resolverTypes'

export type UpdateRetrospectiveTemplateSuccessSource = {
  meetingId: string
}

const UpdateRetrospectiveTemplateSuccess: UpdateRetrospectiveTemplateSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting
  }
}

export default UpdateRetrospectiveTemplateSuccess
