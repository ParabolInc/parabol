import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {NotificationTeamHealthResponseRequestedResolvers} from '../resolverTypes'

const NotificationTeamHealthResponseRequested: NotificationTeamHealthResponseRequestedResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_HEALTH_RESPONSE_REQUESTED',
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId) as Promise<TeamHealthMeeting>
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotificationTeamHealthResponseRequested
