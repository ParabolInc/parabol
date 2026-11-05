export type OrgTeamsSortField = 'name' | 'memberCount' | 'lastMetAt'
export type OrgTeamsSortDirection = 'asc' | 'desc'

interface SortableTeam {
  name: string
  lastMetAt: string | null | undefined
  teamMembersCount: number
}

const sortOrgTeams = <Team extends SortableTeam>(
  teams: readonly Team[],
  sortBy: OrgTeamsSortField,
  sortDirection: OrgTeamsSortDirection
) =>
  [...teams].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      return direction * a.name.localeCompare(b.name)
    } else if (sortBy === 'memberCount') {
      return direction * (a.teamMembersCount - b.teamMembersCount)
    } else {
      // lastMetAt
      const aLastMet = a.lastMetAt
      const bLastMet = b.lastMetAt
      if (!aLastMet && !bLastMet) return 0
      if (!aLastMet) return -direction
      if (!bLastMet) return direction
      return direction * (new Date(aLastMet).getTime() - new Date(bLastMet).getTime())
    }
  })

export default sortOrgTeams
