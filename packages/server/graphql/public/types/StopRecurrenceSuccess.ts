import MeetingSeriesId from '../../../../client/shared/gqlIds/MeetingSeriesId'
import {StopRecurrenceSuccessResolvers} from '../resolverTypes'

export type StopRecurrenceSuccessSource = {
  meetingSeriesId: string
}

const StopRecurrenceSuccess: StopRecurrenceSuccessResolvers = {
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    const id = MeetingSeriesId.split(meetingSeriesId)
    return dataLoader.get('meetingSeries').loadNonNull(id)
  }
}

export default StopRecurrenceSuccess
