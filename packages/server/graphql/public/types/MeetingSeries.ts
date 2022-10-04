import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async (meetingSeries, _args, {dataLoader}) => {
    return dataLoader.get('activeMeetingsByMeetingSeriesId').load(meetingSeries.id)
  }
}

export default MeetingSeries
