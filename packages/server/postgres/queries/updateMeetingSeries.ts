import getPg from '../getPg'
import {
  IUpdateMeetingSeriesByIdQueryParams,
  updateMeetingSeriesByIdQuery
} from './generated/updateMeetingSeriesByIdQuery'

const updateMeetingSeries = async (
  update: Partial<IUpdateMeetingSeriesByIdQueryParams>,
  meetingSeriesIds: number | number[]
) => {
  meetingSeriesIds = typeof meetingSeriesIds === 'number' ? [meetingSeriesIds] : meetingSeriesIds
  return updateMeetingSeriesByIdQuery.run(
    {
      ...update,
      ids: meetingSeriesIds
    } as any,
    getPg()
  )
}

export default updateMeetingSeries
