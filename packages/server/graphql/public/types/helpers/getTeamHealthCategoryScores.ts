import {normalizeLikertMean} from '../../../../../client/shared/teamHealth/normalizeLikertMean'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'

export interface TeamHealthCategoryScoreSource {
  meetingId: string
  categoryId: number
  meanScore: number
  normalizedScore: number
  respondentCount: number
  responseCount: number
}

// Question rotation means the questions asked change from cycle to cycle, so a question is not a
// stable unit to trend on. A category is: it survives rotation, template edits, and pack swaps,
// which makes it the only sound unit for comparing a team against its own past.
export const getTeamHealthCategoryScores = async (
  meetingIds: readonly string[],
  dataLoader: DataLoaderInstance
) => {
  const responsesByMeetingId = await Promise.all(
    meetingIds.map((meetingId) => dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId))
  )
  const responses = responsesByMeetingId.flat()
  const questionIds = [...new Set(responses.map(({questionId}) => questionId))]
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const categoryIdByQuestionId = new Map(questions.map(({id, categoryId}) => [id, categoryId]))
  const categoryIds = [...new Set(questions.map(({categoryId}) => categoryId))]
  const categories = (await dataLoader.get('teamHealthCategories').loadMany(categoryIds)).filter(
    isValid
  )
  // sortOrder then id, the same stable ordering the client colors categories by
  const categoryRank = new Map(
    categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((category, idx) => [category.id, idx])
  )

  return meetingIds.map((meetingId, meetingIdx) => {
    const scoresByCategoryId = new Map<number, {scores: number[]; userIds: Set<string>}>()
    for (const response of responsesByMeetingId[meetingIdx]!) {
      // a null score is a skipped question: it carries no signal, so it moves neither the mean nor
      // the counts. A member who skipped every question in a category is not a respondent to it
      if (response.score === null || response.score === undefined) continue
      const categoryId = categoryIdByQuestionId.get(response.questionId)
      if (categoryId === undefined) continue
      let entry = scoresByCategoryId.get(categoryId)
      if (!entry) {
        entry = {scores: [], userIds: new Set()}
        scoresByCategoryId.set(categoryId, entry)
      }
      entry.scores.push(response.score)
      entry.userIds.add(response.userId)
    }
    return [...scoresByCategoryId.entries()]
      .map(([categoryId, {scores, userIds}]): TeamHealthCategoryScoreSource => {
        const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        return {
          meetingId,
          categoryId,
          meanScore,
          normalizedScore: normalizeLikertMean(meanScore),
          respondentCount: userIds.size,
          responseCount: scores.length
        }
      })
      .sort((a, b) => (categoryRank.get(a.categoryId) ?? 0) - (categoryRank.get(b.categoryId) ?? 0))
  })
}
