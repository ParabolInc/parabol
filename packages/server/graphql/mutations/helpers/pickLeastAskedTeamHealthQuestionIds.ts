import {createHash} from 'crypto'

const tiebreakHash = (templateId: string, questionId: number) =>
  createHash('sha256').update(`${templateId}:${questionId}`).digest('hex')

/**
 * Picks one question per category: the one asked the fewest times so far, breaking ties with the
 * lowest hash of (templateId, questionId).
 *
 * The tiebreak is deterministic so a new series' meetings depend only on the template, which is
 * what lets TeamHealthTemplate.upcomingMeetingPreviews simulate them. Hashing each question on its
 * own keeps that preview stable when unrelated questions are added or removed.
 */
const pickLeastAskedTeamHealthQuestionIds = (
  questions: readonly {id: number; categoryId: number}[],
  askCountByQuestionId: ReadonlyMap<number, number>,
  templateId: string
) => {
  const questionsByCategoryId = new Map<number, (typeof questions)[number][]>()
  for (const question of questions) {
    const categoryQuestions = questionsByCategoryId.get(question.categoryId) ?? []
    categoryQuestions.push(question)
    questionsByCategoryId.set(question.categoryId, categoryQuestions)
  }
  const selectedQuestions = [...questionsByCategoryId.values()].map((categoryQuestions) => {
    const minAskCount = Math.min(
      ...categoryQuestions.map((question) => askCountByQuestionId.get(question.id) ?? 0)
    )
    return categoryQuestions
      .filter((question) => (askCountByQuestionId.get(question.id) ?? 0) === minAskCount)
      .map((question) => ({question, hash: tiebreakHash(templateId, question.id)}))
      .reduce((lowest, candidate) => (candidate.hash < lowest.hash ? candidate : lowest)).question
  })

  return selectedQuestions.map((question) => question.id)
}

export default pickLeastAskedTeamHealthQuestionIds
