import hashTeamHealthQuestionIds from './hashTeamHealthQuestionIds'
import pickLeastAskedTeamHealthQuestionIds, {
  type RotatableTeamHealthQuestion
} from './pickLeastAskedTeamHealthQuestionIds'

/**
 * Simulates a new series: each meeting asks the least-asked question per category, then counts as
 * history for the next. Runs until every question has come up once.
 */
const previewTeamHealthMeetingQuestionIds = async (
  questions: readonly RotatableTeamHealthQuestion[]
) => {
  const tiebreakHashByQuestionId = await hashTeamHealthQuestionIds(questions.map(({id}) => id))
  const categorySizes = new Map<string | number, number>()
  for (const {categoryId} of questions) {
    categorySizes.set(categoryId, (categorySizes.get(categoryId) ?? 0) + 1)
  }
  const meetingCount = Math.max(0, ...categorySizes.values())
  const askCountByQuestionId = new Map<string, number>()
  return Array.from({length: meetingCount}, () => {
    const questionIds = pickLeastAskedTeamHealthQuestionIds(
      questions,
      askCountByQuestionId,
      tiebreakHashByQuestionId
    )
    for (const questionId of questionIds) {
      askCountByQuestionId.set(questionId, (askCountByQuestionId.get(questionId) ?? 0) + 1)
    }
    return questionIds
  })
}

export default previewTeamHealthMeetingQuestionIds
