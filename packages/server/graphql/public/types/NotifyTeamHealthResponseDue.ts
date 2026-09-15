import type {NotifyTeamHealthResponseDueResolvers} from '../resolverTypes'

const NotifyTeamHealthResponseDue: NotifyTeamHealthResponseDueResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_HEALTH_RESPONSE_DUE',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') {
      throw new Error('Notification meeting is not a Team Health meeting')
    }
    return meeting
  }
}

export default NotifyTeamHealthResponseDue
