import ms from 'ms'
import {REPORT_HIDDEN_VALUE} from '../../../client/shared/reports/reportCatalog'
import averageTeamHealthScore from '../../utils/averageTeamHealthScore'
import type {ReportMeasureFunction, ReportMeasureQuery} from '../reportMeasureTypes'
import {
  findLatestTeamHealthCheck,
  groupTeamHealthAnswers,
  type PickedTeamHealthCheck
} from './teamHealthAnswers'

const LOOKBACK = ms('90d')

// Over time, a step's window is the 90 days before it, so a team that stopped checking drops out; otherwise it's the
// period. Teams check in about once a quarter, so an earlier period compared with reaches back at least 90 days, or a
// short period would rarely hold a check to compare with
export const toHealthCheckWindowStart = (
  at: Date,
  periodStart: Date,
  hasTimeSteps: boolean,
  check: ReportMeasureQuery['check']
) => {
  const lookbackStart = new Date(at.getTime() - LOOKBACK)
  if (hasTimeSteps) return lookbackStart
  return check === 'earlier' && lookbackStart < periodStart ? lookbackStart : periodStart
}

// Each team's latest check in the window, or the check before it when comparing checks. A hidden check isn't swapped
// for an older one
const readHealthScore: ReportMeasureFunction = async (query, dataLoader) => {
  const {teamIds, stepStarts, readAt, hasTimeSteps, check} = query
  const checksByTeam = await dataLoader.get('teamHealthChecksByTeamId').loadMany(teamIds)
  const picks = readAt.flatMap((at, stepIdx) => {
    const windowStart = toHealthCheckWindowStart(at, stepStarts[0]!, hasTimeSteps, check)
    return teamIds.flatMap((teamId, teamIdx): PickedTeamHealthCheck[] => {
      const checks = checksByTeam[teamIdx]
      if (!checks || checks instanceof Error) return []
      const latestIdx = findLatestTeamHealthCheck(checks, at, windowStart)
      const picked =
        latestIdx === -1 ? null : checks[check === 'previous' ? latestIdx + 1 : latestIdx]
      return picked ? [{stepIndex: stepIdx + 1, teamId, checkId: picked.id}] : []
    })
  })
  const {groups, hiddenTeamIds, labels} = await groupTeamHealthAnswers(picks, query, dataLoader)
  return {
    rows: groups.map(({stepIndex, keys, scores}) => ({
      stepIndex,
      keys,
      value: scores ? averageTeamHealthScore(scores) : REPORT_HIDDEN_VALUE
    })),
    estimatedCount: 0,
    labels,
    hiddenTeamIds
  }
}

export default readHealthScore
