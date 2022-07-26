import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import getPg from '../getPg'
import {
  getMeetingSeriesByIdsQuery,
  IGetMeetingSeriesByIdsQueryResult
} from './generated/getMeetingSeriesByIdsQuery'

export interface MeetingSeries extends IGetMeetingSeriesByIdsQueryResult {}

const getMeetingSeriesByIds = async (meetingSeriesIds: readonly string[]) => {
  const meetingSeriesResults = await getMeetingSeriesByIdsQuery.run(
    {ids: meetingSeriesIds.map((id) => MeetingSeriesId.split(id))},
    getPg()
  )

  return meetingSeriesResults.map((meetingSeries) => {
    return {
      ...meetingSeries,
      id: MeetingSeriesId.join(meetingSeries.id)
    }
  })
}

export default getMeetingSeriesByIds
