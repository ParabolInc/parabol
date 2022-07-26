import {StartRecurrenceSuccessResolvers} from '../resolverTypes'

export type StartRecurrenceSuccessSource = {
  meetingId: string
  meetingSeriesId: string
}

const StartRecurrenceSuccess: StartRecurrenceSuccessResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId)
  },
  meetingSeries: async (source, _args, {dataLoader}) => {
    const {meetingSeriesId} = source
    return dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
  }
}

export default StartRecurrenceSuccess
