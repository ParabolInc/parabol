import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {TeamHealthTrendPointResolvers} from '../resolverTypes'

const TeamHealthTrendPoint: TeamHealthTrendPointResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId) as Promise<TeamHealthMeeting>
  }
}

export default TeamHealthTrendPoint
