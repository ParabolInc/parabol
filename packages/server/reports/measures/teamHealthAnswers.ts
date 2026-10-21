import {MIN_REPORT_HEALTH_RESPONDENTS} from '../../../client/shared/reports/reportCatalog'
import type RootDataLoader from '../../dataloader/RootDataLoader'
import isValid from '../../graphql/isValid'
import groupTeamHealthScores from '../../utils/groupTeamHealthScores'
import type {ReportMeasureQuery} from '../reportMeasureTypes'

export interface PickedTeamHealthCheck {
  stepIndex: number
  teamId: string
  checkId: string
}

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
// answered adds nothing, and its team is named as hidden
export const groupTeamHealthAnswers = async (
  picks: PickedTeamHealthCheck[],
  {dimensions, filters}: ReportMeasureQuery,
  dataLoader: RootDataLoader
) => {
  const answers = await loadCheckAnswers(
    [...new Set(picks.map(({checkId}) => checkId))],
    dataLoader
  )
  const categoryFilter = filters.find(({dimension}) => dimension === 'CATEGORY')
  const hiddenTeamIds = new Set<string>()
  const groups = new Map<string, {stepIndex: number; keys: string[]; scores: number[]}>()
  for (const {stepIndex, teamId, checkId} of picks) {
    const checkAnswers = answers.get(checkId)
    if (!checkAnswers) continue
    if (checkAnswers.isHidden) {
      hiddenTeamIds.add(teamId)
      continue
    }
    for (const [categoryId, scores] of checkAnswers.scoresByCategoryId) {
      const category = String(categoryId)
      if (categoryFilter && !categoryFilter.values.includes(category)) continue
      const keys = dimensions.map((dimension) => (dimension === 'TEAM' ? teamId : category))
      const groupKey = JSON.stringify([stepIndex, ...keys])
      const group = groups.get(groupKey) ?? {stepIndex, keys, scores: []}
      group.scores.push(...scores)
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
