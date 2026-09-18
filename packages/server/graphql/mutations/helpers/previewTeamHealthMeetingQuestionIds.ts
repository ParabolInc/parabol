import pickLeastAskedTeamHealthQuestionIds from './pickLeastAskedTeamHealthQuestionIds'

const MAX_PREVIEWED_MEETINGS = 12

/**
 * Simulates a new series: each meeting asks the least-asked question per category, then counts as
 * history for the next. Stops once every question has come up, or at MAX_PREVIEWED_MEETINGS.
 */
const previewTeamHealthMeetingQuestionIds = (
  questions: readonly {id: number; categoryId: number}[],
  templateId: string
) => {
  const categorySizes = new Map<number, number>()
  for (const {categoryId} of questions) {
    categorySizes.set(categoryId, (categorySizes.get(categoryId) ?? 0) + 1)
  }
  const meetingCount = Math.min(Math.max(0, ...categorySizes.values()), MAX_PREVIEWED_MEETINGS)
  const askCountByQuestionId = new Map<number, number>()
  return Array.from({length: meetingCount}, () => {
    const questionIds = pickLeastAskedTeamHealthQuestionIds(
      questions,
      askCountByQuestionId,
      templateId
    )
    for (const questionId of questionIds) {
      askCountByQuestionId.set(questionId, (askCountByQuestionId.get(questionId) ?? 0) + 1)
    }
    return questionIds
  })
}

export default previewTeamHealthMeetingQuestionIds
