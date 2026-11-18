import type {UpdateMeetingSeriesPayloadResolvers} from '../resolverTypes'

export type UpdateMeetingSeriesPayloadSource = {
  meetingSeriesId: number
}

const UpdateMeetingSeriesPayload: UpdateMeetingSeriesPayloadResolvers = {
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    return await dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
  }
}

export default UpdateMeetingSeriesPayload
