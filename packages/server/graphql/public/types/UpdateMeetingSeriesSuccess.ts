import type {UpdateMeetingSeriesSuccessResolvers} from '../resolverTypes'

export type UpdateMeetingSeriesSuccessSource = {
  meetingSeriesId: number
}

const UpdateMeetingSeriesSuccess: UpdateMeetingSeriesSuccessResolvers = {
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    return await dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
  }
}

export default UpdateMeetingSeriesSuccess
