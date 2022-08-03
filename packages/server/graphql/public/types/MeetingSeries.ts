import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  }
}

export default MeetingSeries
