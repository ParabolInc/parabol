import {
  MIN_REPORT_HEALTH_RESPONDENTS,
  REPORT_STRUCTURE_NOT_SET,
  REPORT_STRUCTURE_REMOVED
} from '../../../client/shared/reports/reportCatalog'
import type RootDataLoader from '../../dataloader/RootDataLoader'
import isValid from '../../graphql/isValid'
import groupTeamHealthScores from '../../utils/groupTeamHealthScores'
import {isLevelDimension, toLevelId} from '../orgStructure'
import type {ReportMeasureQuery, ReportQueryDimension} from '../reportMeasureTypes'

export interface PickedTeamHealthAnswers {
  stepIndex: number
  teamId: string
  checkId: string
  categoryId: number
  template: {key: string; label: string | null}
}

export type TeamHealthCheckAnswers = Map<
  string,
  {scoresByCategoryId: Map<number, number[]>; isHidden: boolean}
>

export const isInTeamHealthWindow = ({endedAt}: {endedAt: Date}, at: Date, windowStart: Date) =>
  endedAt < at && endedAt >= windowStart

// Each category's latest check in the window, from a team's checks newest first, so a check that asked about less
// doesn't drop what an older one said. A split, like by template, picks each split's latest. A hidden check still
// takes its categories, so it isn't swapped for an older one
export const pickLatestCheckByCategory = <Check extends {endedAt: Date}>(
  checks: readonly Check[],
  categoryIdsOf: (check: Check) => readonly number[],
  at: Date,
  windowStart: Date,
  splitKeyOf: (check: Check) => string = () => ''
) => {
  const picks = new Map<string, {check: Check; categoryId: number}>()
  for (const check of checks) {
    if (!isInTeamHealthWindow(check, at, windowStart)) continue
    const splitKey = splitKeyOf(check)
    for (const categoryId of categoryIdsOf(check)) {
      const pickKey = JSON.stringify([splitKey, categoryId])
      if (!picks.has(pickKey)) picks.set(pickKey, {check, categoryId})
    }
  }
  return [...picks.values()]
}

export const loadCheckAnswers = async (
  checkIds: string[],
  dataLoader: RootDataLoader
): Promise<TeamHealthCheckAnswers> => {
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

// The scored answers picked, split by step and the report's breakdown. A check too few people answered adds nothing:
// its team is named as hidden, and so is any group only hidden checks fall in
export const groupTeamHealthAnswers = async (
  picks: PickedTeamHealthAnswers[],
  answers: TeamHealthCheckAnswers,
  {orgId, dimensions}: ReportMeasureQuery,
  dataLoader: RootDataLoader
) => {
  const {placements} = await dataLoader.get('orgStructureByOrgId').load(orgId)
  // an org structure level groups a team's answers under the value the team sits at
  const keyOf = (
    dimension: ReportQueryDimension,
    {teamId, categoryId, template}: PickedTeamHealthAnswers
  ) => {
    if (!isLevelDimension(dimension)) {
      if (dimension === 'TEAM') return teamId
      return dimension === 'TEMPLATE' ? template.key : String(categoryId)
    }
    const levelId = toLevelId(dimension)
    if (levelId === 0) return REPORT_STRUCTURE_REMOVED
    const placement = placements.find(
      (place) => place.teamId === teamId && place.levelId === levelId
    )
    return placement ? String(placement.valueId) : REPORT_STRUCTURE_NOT_SET
  }
  const hiddenTeamIds = new Set<string>()
  const templateLabels: Record<string, string> = {}
  // a group's scores stay null while only hidden checks fall in it, so the answers of others still show
  const groups = new Map<string, {stepIndex: number; keys: string[]; scores: number[] | null}>()
  for (const pick of picks) {
    const checkAnswers = answers.get(pick.checkId)
    const scores = checkAnswers?.scoresByCategoryId.get(pick.categoryId)
    if (!checkAnswers || !scores) continue
    if (checkAnswers.isHidden) hiddenTeamIds.add(pick.teamId)
    if (pick.template.label) templateLabels[pick.template.key] = pick.template.label
    const keys = dimensions.map((dimension) => keyOf(dimension, pick))
    const groupKey = JSON.stringify([pick.stepIndex, ...keys])
    const group = groups.get(groupKey) ?? {stepIndex: pick.stepIndex, keys, scores: null}
    if (!checkAnswers.isHidden) group.scores = [...(group.scores ?? []), ...scores]
    groups.set(groupKey, group)
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
    labels: {
      ...(categoryPosition === -1
        ? {}
        : {CATEGORY: Object.fromEntries(categories.map(({id, name}) => [String(id), name]))}),
      ...(dimensions.includes('TEMPLATE') ? {TEMPLATE: templateLabels} : {})
    }
  }
}
