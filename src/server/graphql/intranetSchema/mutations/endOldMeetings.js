import {GraphQLInt} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import endMeeting from 'server/graphql/mutations/endMeeting'
import {requireSU} from 'server/utils/authorization'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import {OLD_MEETING_AGE} from 'server/utils/serverConstants'
import endNewMeeting from 'server/graphql/mutations/endNewMeeting'

const endOldMeetings = {
  type: GraphQLInt,
  description: 'close all meetings that started before the given threshold',
  resolve: async (source, args, {authToken, dataLoader}) => {
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

    const {legacyMeetingTeamIds, newMeetingMeetingIds} = await r({
      legacyMeetingTeamIds: r
        .table('Meeting')
        .getAll(r.args(meetingIdsInProgress), {index: 'id'})
        .filter((meeting) => meeting('createdAt').le(activeThresh))('teamId')
        .coerceTo('array'),
      newMeetingMeetingIds: r
        .table('NewMeeting')
        .getAll(r.args(meetingIdsInProgress), {index: 'id'})
        .filter((meeting) => meeting('createdAt').le(activeThresh))('id')
        .coerceTo('array')
    })

    await Promise.all(
      legacyMeetingTeamIds.map((teamId) => {
        sendSegmentEvent('endOldMeeting', authToken.sub, {teamId})
        return endMeeting.resolve(undefined, {teamId}, {authToken, socketId: '', dataLoader})
      })
    )

    await Promise.all(
      newMeetingMeetingIds.map((meetingId) => {
        sendSegmentEvent('endOldMeeting', authToken.sub, {meetingId})
        return endNewMeeting.resolve(undefined, {meetingId}, {authToken, socketId: '', dataLoader})
      })
    )

    return legacyMeetingTeamIds.length + newMeetingMeetingIds.length
  }
}

export default endOldMeetings
