import getPg from '../getPg'
import {
  getMeetingSeriesByIdsQuery,
  IGetMeetingSeriesByIdsQueryResult
} from './generated/getMeetingSeriesByIdsQuery'

export interface MeetingSeries extends IGetMeetingSeriesByIdsQueryResult {}

const getMeetingSeriesByIds = async (meetingSeriesIds: readonly number[]) => {
  const meetingSeriesResults = await getMeetingSeriesByIdsQuery.run(
    {ids: meetingSeriesIds},
    getPg()
  )

  return meetingSeriesResults
}

export default getMeetingSeriesByIds
