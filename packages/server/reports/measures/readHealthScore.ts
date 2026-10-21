import ms from 'ms'
import averageTeamHealthScore from '../../utils/averageTeamHealthScore'
import type {ReportMeasureFunction} from '../reportMeasureTypes'
import {groupTeamHealthAnswers, type PickedTeamHealthCheck} from './teamHealthAnswers'

const LOOKBACK = ms('90d')

// Each team's latest check in the window, or the check before it when comparing checks. Over time, a step's
// window is the 90 days before it, so a team that stopped checking drops out; otherwise it's the period.
// A hidden check isn't swapped for an older one
const readHealthScore: ReportMeasureFunction = async (query, dataLoader) => {
  const {teamIds, stepStarts, readAt, hasTimeSteps, check} = query
  const checksByTeam = await dataLoader.get('teamHealthChecksByTeamId').loadMany(teamIds)
  const picks = readAt.flatMap((at, stepIdx) => {
    const windowStart = hasTimeSteps ? new Date(at.getTime() - LOOKBACK) : stepStarts[0]!
    return teamIds.flatMap((teamId, teamIdx): PickedTeamHealthCheck[] => {
      const checks = checksByTeam[teamIdx]
      if (!checks || checks instanceof Error) return []
      const latestIdx = checks.findIndex(({endedAt}) => endedAt < at && endedAt >= windowStart)
      const picked =
        latestIdx === -1 ? null : checks[check === 'latest' ? latestIdx : latestIdx + 1]
      return picked ? [{stepIndex: stepIdx + 1, teamId, checkId: picked.id}] : []
    })
  })
  const {groups, hiddenTeamIds, labels} = await groupTeamHealthAnswers(picks, query, dataLoader)
  return {
    rows: groups.map(({stepIndex, keys, scores}) => ({
      stepIndex,
      keys,
      value: averageTeamHealthScore(scores)
    })),
    estimatedCount: 0,
    labels,
    hiddenTeamIds
  }
}

export default readHealthScore
