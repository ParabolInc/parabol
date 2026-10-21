import type {ReportMeasureFunction} from '../reportMeasureTypes'
import {groupTeamHealthAnswers, type PickedTeamHealthCheck} from './teamHealthAnswers'

// Every check's answers count in the step its results were revealed
const countHealthAnswers: ReportMeasureFunction = async (query, dataLoader) => {
  const {teamIds, stepStarts, stepEnds} = query
  const checksByTeam = await dataLoader.get('teamHealthChecksByTeamId').loadMany(teamIds)
  const picks = teamIds.flatMap((teamId, teamIdx): PickedTeamHealthCheck[] => {
    const checks = checksByTeam[teamIdx]
    if (!checks || checks instanceof Error) return []
    return checks.flatMap(({id, endedAt}) => {
      const stepIdx = stepStarts.findIndex(
        (start, idx) => endedAt >= start && endedAt < stepEnds[idx]!
      )
      return stepIdx === -1 ? [] : [{stepIndex: stepIdx + 1, teamId, checkId: id}]
    })
  })
  const {groups, hiddenTeamIds, labels} = await groupTeamHealthAnswers(picks, query, dataLoader)
  return {
    rows: groups.map(({stepIndex, keys, scores}) => ({stepIndex, keys, value: scores.length})),
    estimatedCount: 0,
    labels,
    hiddenTeamIds
  }
}

export default countHealthAnswers
