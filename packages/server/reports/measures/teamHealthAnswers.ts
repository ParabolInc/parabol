import {
  MIN_REPORT_HEALTH_RESPONDENTS,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED
} from '../../../client/shared/reports/reportCatalog'
import type RootDataLoader from '../../dataloader/RootDataLoader'
import isValid from '../../graphql/isValid'
import groupTeamHealthScores from '../../utils/groupTeamHealthScores'
import type {ReportMeasureQuery, ReportQueryDimension} from '../reportMeasureTypes'
import {isLevelDimension, toLevelRowId} from '../teamStructure'

export interface PickedTeamHealthCheck {
  stepIndex: number
  teamId: string
  checkId: string
}

// a team's checks come newest first, so this is its latest check revealed in the window
export const findLatestTeamHealthCheck = (
  checks: readonly {endedAt: Date}[],
  at: Date,
  windowStart: Date
) => checks.findIndex(({endedAt}) => endedAt < at && endedAt >= windowStart)

const loadCheckAnswers = async (checkIds: string[], dataLoader: RootDataLoader) => {
  const responsesByCheck = (
    await dataLoader.get('teamHealthResponsesByMeetingId').loadMany(checkIds)
  ).map((responses) => (responses instanceof Error ? [] : responses))
  const questionIds = [...new Set(responsesByCheck.flat().map(({questionId}) => questionId))]
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const categoryIdByQuestionId = new Map(questions.map(({id, categoryId}) => [id, categoryId]))
  return new Map(
    checkIds.map((checkId, idx) => {
      const responses = responsesByCheck[idx] ?? []
      const respondents = new Set(
        responses.flatMap(({userId, score}) => (score === null ? [] : [userId]))
      )
      return [
        checkId,
        {
          scoresByCategoryId: groupTeamHealthScores(responses, categoryIdByQuestionId),
          isHidden: respondents.size < MIN_REPORT_HEALTH_RESPONDENTS
        }
      ]
    })
  )
}

// The scored answers in the picked checks, split by step and the report's breakdown. A check too few people
// answered adds nothing: its team is named as hidden, and so is any group only hidden checks fall in
export const groupTeamHealthAnswers = async (
  picks: PickedTeamHealthCheck[],
  {orgId, dimensions, filters}: ReportMeasureQuery,
  dataLoader: RootDataLoader
) => {
  const [answers, {placements}] = await Promise.all([
    loadCheckAnswers([...new Set(picks.map(({checkId}) => checkId))], dataLoader),
    dataLoader.get('teamStructureByOrgId').load(orgId)
  ])
  // a team structure level groups a team's answers under the value the team sits at
  const keyOf = (dimension: ReportQueryDimension, teamId: string, category: string) => {
    if (!isLevelDimension(dimension)) return dimension === 'TEAM' ? teamId : category
    const levelRowId = toLevelRowId(dimension)
    if (levelRowId === 0) return REPORT_STRUCTURE_REMOVED
    const placement = placements.find(
      (place) => place.teamId === teamId && place.levelId === levelRowId
    )
    return placement ? String(placement.valueId) : REPORT_STRUCTURE_NOT_SET
  }
  const categoryFilter = filters.find(({dimension}) => dimension === 'CATEGORY')
  const hiddenTeamIds = new Set<string>()
  // a group's scores stay null while only hidden checks fall in it, so the answers of others still show
  const groups = new Map<string, {stepIndex: number; keys: string[]; scores: number[] | null}>()
  for (const {stepIndex, teamId, checkId} of picks) {
    const checkAnswers = answers.get(checkId)
    if (!checkAnswers) continue
    if (checkAnswers.isHidden) hiddenTeamIds.add(teamId)
    for (const [categoryId, scores] of checkAnswers.scoresByCategoryId) {
      const category = String(categoryId)
      if (categoryFilter && !categoryFilter.values.includes(category)) continue
      const keys = dimensions.map((dimension) => keyOf(dimension, teamId, category))
      const groupKey = JSON.stringify([stepIndex, ...keys])
      const group = groups.get(groupKey) ?? {stepIndex, keys, scores: null}
      if (!checkAnswers.isHidden) group.scores = [...(group.scores ?? []), ...scores]
      groups.set(groupKey, group)
    }
  }
  const categoryPosition = dimensions.indexOf('CATEGORY')
  const categoryIds = [
    ...new Set([...groups.values()].map(({keys}) => Number(keys[categoryPosition])))
  ]
  const categories =
    categoryPosition === -1
      ? []
      : (await dataLoader.get('teamHealthCategories').loadMany(categoryIds)).filter(isValid)
  return {
    groups: [...groups.values()],
    hiddenTeamIds: [...hiddenTeamIds],
    labels:
      categoryPosition === -1
        ? {}
        : {CATEGORY: Object.fromEntries(categories.map(({id, name}) => [String(id), name]))}
  }
}
