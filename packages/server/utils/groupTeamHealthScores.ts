// Each category's scored answers in a check. The meeting's own history and reports both group answers here,
// so a category's score is worked out one way
const groupTeamHealthScores = (
  responses: readonly {questionId: number; score: number | null}[],
  categoryIdByQuestionId: Map<number, number>
) => {
  const scoresByCategoryId = new Map<number, number[]>()
  for (const {questionId, score} of responses) {
    const categoryId = categoryIdByQuestionId.get(questionId)
    if (categoryId === undefined || score === null) continue
    const scores = scoresByCategoryId.get(categoryId) ?? []
    scores.push(score)
    scoresByCategoryId.set(categoryId, scores)
  }
  return scoresByCategoryId
}

export default groupTeamHealthScores
