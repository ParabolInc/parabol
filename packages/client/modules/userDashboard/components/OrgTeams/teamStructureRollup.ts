import {REPORT_STRUCTURE_LABELS} from '../../../../shared/reports/reportCatalog'
import type {TeamStructureLevelData} from './teamStructureEdits'

export interface TeamStructureRollupRow {
  key: string
  depth: number
  name: string
  teamCount: number
  isNotSet: boolean
}

const groupTeams = (level: TeamStructureLevelData, teamIds: readonly string[]) => {
  const groups = level.values.map(({id, name, teamIds: placedTeamIds}) => ({
    key: id,
    name,
    teamIds: teamIds.filter((teamId) => placedTeamIds.includes(teamId)),
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
export const toTeamStructureRollup = (
  orgName: string,
  levels: readonly TeamStructureLevelData[],
  teamIds: readonly string[]
): TeamStructureRollupRow[] => {
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
