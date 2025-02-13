import isTeamActive from './isTeamActive'

// Active team is a team that:
// 1. Is not archived
// 2. Has at least 2 active team members (users who are not inactive and not removed from team)
// 3. Has had at least 1 meeting in the last 30 days
const getActiveTeamCountByTeamIds = async (teamIds: string[]) => {
  if (!teamIds.length) return 0
  const activeTeams = await Promise.all(teamIds.map(async (teamId) => await isTeamActive(teamId)))
  return activeTeams.filter(Boolean).length
}

export default getActiveTeamCountByTeamIds
