export interface RotatableTeamHealthQuestion {
  // the id the client sees, so the client & the server hash the same string
  id: string
  categoryId: string | number
}

/**
 * Picks one question per category: the one asked the fewest times so far, breaking ties with the
 * lowest hash of its id (see hashTeamHealthQuestionIds).
 *
 * The client previews a new series with this and the server starts meetings with it, so both
 * arrive at the same questions without talking to each other. Hashing each question on its own
 * keeps the draw stable when unrelated questions are added or removed.
 */
const pickLeastAskedTeamHealthQuestionIds = (
  questions: readonly RotatableTeamHealthQuestion[],
  askCountByQuestionId: ReadonlyMap<string, number>,
  tiebreakHashByQuestionId: ReadonlyMap<string, string>
) => {
  const questionsByCategoryId = new Map<string | number, RotatableTeamHealthQuestion[]>()
  for (const question of questions) {
    const categoryQuestions = questionsByCategoryId.get(question.categoryId) ?? []
    categoryQuestions.push(question)
    questionsByCategoryId.set(question.categoryId, categoryQuestions)
  }
  const tiebreakKey = (questionId: string) =>
    `${tiebreakHashByQuestionId.get(questionId) ?? ''}:${questionId}`
  return [...questionsByCategoryId.values()].map((categoryQuestions) => {
    const minAskCount = Math.min(
      ...categoryQuestions.map(({id}) => askCountByQuestionId.get(id) ?? 0)
    )
    return categoryQuestions
      .filter(({id}) => (askCountByQuestionId.get(id) ?? 0) === minAskCount)
      .map(({id}) => id)
      .reduce((lowest, candidate) =>
        tiebreakKey(candidate) < tiebreakKey(lowest) ? candidate : lowest
      )
  })
}

export default pickLeastAskedTeamHealthQuestionIds
