import {Threshold} from '~/types/constEnums'
import getRethink from '../../../../database/rethinkDriver'
import getKysely from '../../../../postgres/getKysely'
// Uncomment for easier testing
//import { ThresholdTest as Threshold } from "~/types/constEnums";

// Active team is the team that completed 3 meetings with more than 1 attendee
// and have had at least 1 meeting in the last 30 days
// Warning: the query is very expensive
// TODO: store all calculations in the database, e.g. meeting.attendeeCount (see #7975)
const getActiveTeamCountByTeamIds = async (teamIds: string[]) => {
  if (!teamIds.length) return 0
  const r = await getRethink()
  const pg = getKysely()
  const meetingIdsByTeamId = await pg
    .selectFrom('NewMeeting')
    .select(({fn}) => ['teamId', fn<string[]>('array_agg', ['id']).as('meetingIds')])
    .where('teamId', 'in', teamIds)
    .groupBy('teamId')
    .execute()
  const meetingIds = meetingIdsByTeamId.flatMap((row) => row.meetingIds)
  const meetingMembers = await r
    .table('MeetingMember')
    .getAll(r.args(meetingIds), {index: 'meetingId'})
    .run()
  const teamsIdsWithMinMeetingsAndMembers = meetingIdsByTeamId
    .map(({teamId, meetingIds}) => ({
      teamId,
      meetingIds: meetingIds.filter((meetingId) => {
        const memberCount = meetingMembers.filter(
          (meetingMember) => meetingMember.meetingId === meetingId
        ).length
        return memberCount >= Threshold.MIN_STICKY_TEAM_MEETING_ATTENDEES
      })
    }))
    .filter((row) => row.meetingIds.length > Threshold.MIN_STICKY_TEAM_MEETINGS)
    .map((row) => row.teamId)
  if (teamsIdsWithMinMeetingsAndMembers.length === 0) return 0
  const recentMeetings = await pg
    .selectFrom('NewMeeting')
    .distinctOn('teamId')
    .select(['teamId', 'createdAt'])
    .where('teamId', 'in', teamsIdsWithMinMeetingsAndMembers)
    .orderBy(['teamId', 'createdAt desc'])
    .execute()

  return teamsIdsWithMinMeetingsAndMembers.filter((teamId) => {
    const recentMeetingsForTeam = recentMeetings.find(
      (recentMeeting) => recentMeeting.teamId === teamId
    )
    if (!recentMeetingsForTeam) return false
    return (
      recentMeetingsForTeam.createdAt.getTime() >
      Date.now() - Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME
    )
  }).length
}

export default getActiveTeamCountByTeamIds
