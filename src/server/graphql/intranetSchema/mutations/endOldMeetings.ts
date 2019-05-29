import {GraphQLInt} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {requireSU} from 'server/utils/authorization'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import {OLD_MEETING_AGE} from 'server/utils/serverConstants'
import endNewMeeting from 'server/graphql/mutations/endNewMeeting'
import {GQLContext} from 'server/graphql/graphql'

const endOldMeetings = {
  type: GraphQLInt,
  description: 'close all meetings that started before the given threshold',
  resolve: async (_source, _args, {authToken, dataLoader}) => {
    const r = getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const activeThresh = new Date(Date.now() - OLD_MEETING_AGE)
    const meetingIdsInProgress = await r.table('Team').filter((team) =>
      team('meetingId')
        .default(null)
        .ne(null)
    )('meetingId')

    const meetings = await r
      .table('NewMeeting')
      .getAll(r.args(meetingIdsInProgress), {index: 'id'})
      .filter((meeting) => meeting('createdAt').le(activeThresh))
      .pick('id', 'meetingType')

    await Promise.all(
      meetings.map((meeting) => {
        sendSegmentEvent(`Longrunning ${meeting.meetingType} Meeting`, authToken.sub, {
          meetingId: meeting.id
        }).catch()
        if (meeting.meetingType === 'action') {
          return endNewMeeting.resolve(undefined, {meetingId: meeting.id}, {
            authToken,
            socketId: '',
            dataLoader
          } as GQLContext)
        }
        return undefined
      })
    )

    return meetings.length
  }
}

export default endOldMeetings
