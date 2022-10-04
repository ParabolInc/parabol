import getPg from '../getPg'
import {getMeetingSeriesByIdsQuery} from './generated/getMeetingSeriesByIdsQuery'

const getMeetingSeriesByIds = async (meetingSeriesIds: readonly number[]) => {
  const meetingSeriesResults = await getMeetingSeriesByIdsQuery.run(
    {ids: meetingSeriesIds},
    getPg()
  )

  return meetingSeriesResults
}

export default getMeetingSeriesByIds
