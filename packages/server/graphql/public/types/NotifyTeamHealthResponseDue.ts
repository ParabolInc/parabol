import {GraphQLError} from 'graphql'
import type {NotifyTeamHealthResponseDueResolvers} from '../resolverTypes'

const NotifyTeamHealthResponseDue: NotifyTeamHealthResponseDueResolvers = {
  __isTypeOf: ({type}) => type === 'TEAM_HEALTH_RESPONSE_DUE',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') {
      throw new GraphQLError('Notification meeting is not a Team Health meeting', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }
    return meeting
  }
}

export default NotifyTeamHealthResponseDue
