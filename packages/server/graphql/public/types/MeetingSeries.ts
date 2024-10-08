import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {selectNewMeetings} from '../../../postgres/select'
import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async (meetingSeries, _args, {dataLoader}) => {
    const res = await dataLoader.get('activeMeetingsByMeetingSeriesId').load(meetingSeries.id)
    return res || []
  },
  mostRecentMeeting: async ({id: meetingSeriesId}, _args, _context) => {
    const meeting = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .orderBy(['endedAt desc', 'createdAt desc'])
      .limit(1)
      .executeTakeFirstOrThrow()
    return meeting
  }
}

export default MeetingSeries
