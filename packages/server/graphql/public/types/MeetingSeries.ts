import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import getRethink from '../../../database/rethinkDriver'
import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async (meetingSeries, _args, {dataLoader}) => {
    return dataLoader.get('activeMeetingsByMeetingSeriesId').load(meetingSeries.id)
  },
  mostRecentMeeting: async ({id: meetingSeriesId}, _args, _context) => {
    const r = await getRethink()
    const meetings = await r
      .table('NewMeeting')
      .getAll(meetingSeriesId, {index: 'meetingSeriesId'})
      // Sort order: active meetings first, then sorted by when created.
      .orderBy((doc) => (doc('endedAt') ? 0 : 1), r.desc('createdAt'))
      .limit(1)
      .run()
    return meetings[0]
  }
}

export default MeetingSeries
