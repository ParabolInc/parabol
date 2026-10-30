import ms from 'ms'
import {REPORT_HIDDEN_VALUE} from '../../../client/shared/reports/reportCatalog'
import type {TeamHealthCheck} from '../../dataloader/reportLoaderMakers'
import averageTeamHealthScore from '../../utils/averageTeamHealthScore'
import type {ReportMeasureFunction} from '../reportMeasureTypes'
import {
  groupTeamHealthAnswers,
  isInTeamHealthWindow,
  loadCheckAnswers,
  type PickedTeamHealthAnswers,
  pickLatestCheckByCategory,
  toTeamHealthCategoryKey
} from './teamHealthAnswers'
import {toTemplateKey} from './templateExpressions'

const LOOKBACK = ms('90d')

// Over time, a step's window is the 90 days before it, so a team that stopped checking drops out; otherwise it's the
// period. Teams check in about once a quarter, so an earlier period compared with reaches back at least 90 days, or a
// short period would rarely hold a check to compare with
export const toHealthCheckWindowStart = (
  at: Date,
  periodStart: Date,
  hasTimeSteps: boolean,
  isEarlier: boolean
) => {
  const lookbackStart = new Date(at.getTime() - LOOKBACK)
  if (hasTimeSteps) return lookbackStart
  return isEarlier && lookbackStart < periodStart ? lookbackStart : periodStart
}

// Each team's latest check of each category in each step's window, split by template when the report is. An earlier
// period compared with reads only the teams and categories the period it's compared with has, so a team that checked
// in just one of them doesn't move the comparison
const readHealthScore: ReportMeasureFunction = async (query, dataLoader) => {
  const {teamIds, ownTeamIds, stepStarts, readAt, hasTimeSteps, comparedWith} = query
  const {dimensions, filters} = query
  const checksByTeam = (await dataLoader.get('teamHealthChecksByTeamId').loadMany(teamIds)).map(
    (checks) => (checks instanceof Error ? [] : checks)
  )
  const templateOf = (check: TeamHealthCheck) =>
    toTemplateKey(
      {
        templateId: check.templateId,
        teamId: check.teamId,
        scope: check.templateScope,
        name: check.templateName
      },
      ownTeamIds
    )
  const templateFilter = filters.find(({dimension}) => dimension === 'TEMPLATE')
  const categoryFilter = filters.find(({dimension}) => dimension === 'CATEGORY')
  const toWindows = (starts: Date[], ats: Date[], isEarlier: boolean) =>
    ats.map((at) => ({
      at,
      start: toHealthCheckWindowStart(at, starts[0]!, hasTimeSteps, isEarlier)
    }))
  const windows = toWindows(stepStarts, readAt, !!comparedWith)
  const comparedWindows = comparedWith
    ? toWindows(comparedWith.stepStarts, comparedWith.readAt, false)
    : []
  const candidatesByTeam = checksByTeam.map((checks) =>
    checks.filter(
      (check) =>
        (!templateFilter || templateFilter.values.includes(templateOf(check).key)) &&
        [...windows, ...comparedWindows].some(({at, start}) =>
          isInTeamHealthWindow(check, at, start)
        )
    )
  )
  const answers = await loadCheckAnswers(
    [...new Set(candidatesByTeam.flat().map(({id}) => id))],
    dataLoader
  )
  const categoryIdsOf = (check: TeamHealthCheck) =>
    [...(answers.get(check.id)?.scoresByCategoryId.keys() ?? [])].filter(
      (categoryId) =>
        !categoryFilter || categoryFilter.values.includes(toTeamHealthCategoryKey(categoryId))
    )
  const isByTemplate = dimensions.includes('TEMPLATE')
  const pickSteps = (stepWindows: {at: Date; start: Date}[]) =>
    stepWindows.flatMap(({at, start}, stepIdx) =>
      teamIds.flatMap((teamId, teamIdx) =>
        pickLatestCheckByCategory(
          candidatesByTeam[teamIdx]!,
          categoryIdsOf,
          at,
          start,
          isByTemplate ? (check) => templateOf(check).key : undefined
        ).map(
          ({check, categoryId}): PickedTeamHealthAnswers => ({
            stepIndex: stepIdx + 1,
            teamId,
            checkId: check.id,
            categoryId,
            template: templateOf(check)
          })
        )
      )
    )
  const toPairKey = ({stepIndex, teamId, categoryId, template}: PickedTeamHealthAnswers) =>
    JSON.stringify([stepIndex, teamId, categoryId, isByTemplate ? template.key : null])
  const comparedKeys = comparedWith ? new Set(pickSteps(comparedWindows).map(toPairKey)) : null
  const picks = pickSteps(windows).filter(
    (pick) => !comparedKeys || comparedKeys.has(toPairKey(pick))
  )
  const {groups, hiddenTeamIds, labels} = await groupTeamHealthAnswers(
    picks,
    answers,
    query,
    dataLoader
  )
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
