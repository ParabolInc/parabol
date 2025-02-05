import {Threshold} from '~/types/constEnums'
import getKysely from '../../../../postgres/getKysely'

/**
 * Checks if a team is active based on the following criteria:
 * 1. Is not archived
 * 2. Has at least 2 active team members (users who are not inactive and not removed from team)
 * 3. Has had at least 1 meeting in the last 30 days
 */
const isTeamActive = async (teamId: string): Promise<boolean> => {
  const pg = getKysely()

  // Check if team is archived
  const team = await pg
    .selectFrom('Team')
    .select(['id'])
    .where('id', '=', teamId)
    .where('isArchived', '=', false)
    .executeTakeFirst()

  if (!team) return false

  // Check for active team members
  const teamMembersWithStatus = await pg
    .selectFrom('TeamMember')
    .innerJoin('User', 'User.id', 'TeamMember.userId')
    .select(['TeamMember.teamId', 'User.inactive'])
    .where('TeamMember.teamId', '=', teamId)
    .where('TeamMember.isNotRemoved', '=', true)
    .execute()

  const activeMembers = teamMembersWithStatus.filter((member) => !member.inactive)
  if (activeMembers.length < Threshold.MIN_ACTIVE_TEAM_MEETING_ATTENDEES) return false

  // Check for recent meeting activity
  const recentMeeting = await pg
    .selectFrom('NewMeeting')
    .select(['createdAt'])
    .where('teamId', '=', teamId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()

  if (!recentMeeting) return false

  return (
    recentMeeting.createdAt.getTime() > Date.now() - Threshold.ACTIVE_TEAM_LAST_MEETING_TIMEFRAME
  )
}

export default isTeamActive
