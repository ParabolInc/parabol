import {REPORT_STRUCTURE_LABELS} from '../../../../shared/reports/reportCatalog'
import type {OrgStructureLevelData} from './orgStructureEdits'

export interface OrgStructureRollupRow {
  key: string
  depth: number
  name: string
  teamCount: number
  isNotSet: boolean
}

const groupTeams = (level: OrgStructureLevelData, teamIds: readonly string[]) => {
  const groups = level.values.map(({id, name, teams}) => ({
    key: id,
    name,
    teamIds: teamIds.filter((teamId) => teams.some((team) => team.id === teamId)),
    isNotSet: false
  }))
  const unplacedTeamIds = teamIds.filter(
    (teamId) => !groups.some((group) => group.teamIds.includes(teamId))
  )
  return unplacedTeamIds.length === 0
    ? groups
    : [
        ...groups,
        {
          key: 'notSet',
          name: REPORT_STRUCTURE_LABELS.notSet,
          teamIds: unplacedTeamIds,
          isNotSet: true
        }
      ]
}

// How reports split the teams by the first two levels: every value of the first, and the values of the
// second that hold any of its teams
export const toOrgStructureRollup = (
  orgName: string,
  levels: readonly OrgStructureLevelData[],
  teamIds: readonly string[]
): OrgStructureRollupRow[] => {
  const [widest, next] = levels
  if (!widest) return []
  return [
    {key: 'org', depth: 0, name: orgName, teamCount: teamIds.length, isNotSet: false},
    ...groupTeams(widest, teamIds).flatMap((group) => [
      {
        key: group.key,
        depth: 1,
        name: group.name,
        teamCount: group.teamIds.length,
        isNotSet: group.isNotSet
      },
      ...(next && !group.isNotSet
        ? groupTeams(next, group.teamIds)
            .filter((child) => child.teamIds.length > 0)
            .map((child) => ({
              key: `${group.key}:${child.key}`,
              depth: 2,
              name: child.name,
              teamCount: child.teamIds.length,
              isNotSet: child.isNotSet
            }))
        : [])
    ])
  ]
}
