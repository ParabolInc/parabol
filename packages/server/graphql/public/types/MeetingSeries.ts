import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {selectNewMeetings} from '../../../postgres/select'
import {AnyMeeting} from '../../../postgres/types/Meeting'
import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async (meetingSeries, _args, {dataLoader}) => {
    return dataLoader.get('activeMeetingsByMeetingSeriesId').load(meetingSeries.id)
  },
  mostRecentMeeting: async ({id: meetingSeriesId}, _args, _context) => {
    const meeting = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .orderBy(['endedAt desc', 'createdAt desc'])
      .limit(1)
      .$narrowType<AnyMeeting>()
      .executeTakeFirstOrThrow()
    return meeting
  }
}

export default MeetingSeries
