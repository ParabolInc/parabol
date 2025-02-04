import {Threshold} from '~/types/constEnums'
import getKysely from '../../../../postgres/getKysely'
// Uncomment for easier testing
//import { ThresholdTest as Threshold } from "~/types/constEnums";

// Active team is a team that:
// 1. Is not archived
// 2. Has at least 2 active team members (users who are not inactive and not removed from team)
// 3. Has had at least 1 meeting in the last 30 days
const getActiveTeamCountByTeamIds = async (teamIds: string[]) => {
  if (!teamIds.length) return 0
  const pg = getKysely()

  // First get non-archived teams
  const nonArchivedTeamIds = await pg
    .selectFrom('Team')
    .select(['id'])
    .where('id', 'in', teamIds)
    .where('isArchived', '=', false)
    .execute()
    .then((teams) => teams.map((t) => t.id))

  if (nonArchivedTeamIds.length === 0) return 0

  // Get all team members and their user status for the teams
  const teamMembersWithStatus = await pg
    .selectFrom('TeamMember')
    .innerJoin('User', 'User.id', 'TeamMember.userId')
    .select(['TeamMember.teamId', 'User.inactive'])
    .where('TeamMember.teamId', 'in', nonArchivedTeamIds)
    .where('TeamMember.isNotRemoved', '=', true)
    .execute()

  // Filter teams that have at least 2 active members
  const teamsWithSufficientMembers = nonArchivedTeamIds.filter((teamId) => {
    const activeMembers = teamMembersWithStatus.filter(
      (member) => member.teamId === teamId && !member.inactive
    )
    return activeMembers.length >= Threshold.MIN_STICKY_TEAM_MEETING_ATTENDEES
  })

  if (teamsWithSufficientMembers.length === 0) return 0

  // Get the most recent meeting for each team
  const recentMeetings = await pg
    .selectFrom('NewMeeting')
    .distinctOn('teamId')
    .select(['teamId', 'createdAt'])
    .where('teamId', 'in', teamsWithSufficientMembers)
    .orderBy(['teamId', 'createdAt desc'])
    .execute()

  // Filter teams that have had a meeting in the last 30 days
  return teamsWithSufficientMembers.filter((teamId) => {
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
