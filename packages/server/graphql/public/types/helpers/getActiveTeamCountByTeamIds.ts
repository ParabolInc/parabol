import getRethink from '../../../../database/rethinkDriver'
import {RDatum, RValue} from '../../../../database/stricterR'
import {Threshold} from '~/types/constEnums'
// Uncomment for easier testing
//import { ThresholdTest as Threshold } from "~/types/constEnums";

// Active team is the team that completed 3 meetings with more than 1 attendee
// and have had at least 1 meeting in the last 30 days
// Warning: the query is very expensive
// TODO: store all calculations in the database, e.g. meeting.attendeeCount
const getActiveTeamCountByTeamIds = async (teamIds: string[]) => {
  const r = await getRethink()

  return r
    .table('NewMeeting')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter((row: RDatum) => row('endedAt').default(null).ne(null))('id')
    .coerceTo('array')
    .distinct()
    .do((endedMeetingIds: RValue) => {
      return (
        r
          .table('MeetingMember')
          .getAll(r.args(endedMeetingIds), {index: 'meetingId'})
          .group('teamId', 'meetingId') as RDatum
      )
        .count()
        .ungroup()
        .map((row: RDatum) => ({
          teamId: row('group')(0),
          meetingId: row('group')(1),
          meetingMembers: row('reduction')
        }))
        .filter((row: RDatum) =>
          row('meetingMembers').ge(Threshold.MIN_STICKY_TEAM_MEETING_ATTENDEES)
        )
        .group('teamId')
        .ungroup()
        .filter((row: RDatum) => row('reduction').count().ge(Threshold.MIN_STICKY_TEAM_MEETINGS))
        .filter((row: RValue) => {
          const meetingIds = row('reduction')('meetingId')
          return r
            .table('NewMeeting')
            .getAll(r.args(meetingIds))
            .filter((meeting: RValue) => {
              return meeting('endedAt').during(
                r.now().sub(Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME),
                r.now()
              )
            })
            .count()
            .gt(0)
        })
        .count()
    })
    .run()
}

export default getActiveTeamCountByTeamIds
