import {StopRecurrenceSuccessResolvers} from '../resolverTypes'

export type StopRecurrenceSuccessSource = {
  meetingSeriesId: number
}

const StopRecurrenceSuccess: StopRecurrenceSuccessResolvers = {
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
  }
}

export default StopRecurrenceSuccess
