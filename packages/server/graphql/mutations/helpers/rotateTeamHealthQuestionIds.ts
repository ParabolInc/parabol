import getKysely from '../../../postgres/getKysely'

/**
 * Picks one question per category for a Team Health meeting, rotating so the
 * least-asked question in each category is favored across the meeting series.
 *
 * For each category it tallies how many prior meetings in the series asked each
 * question (via the TeamHealthResponse table), finds the category minimum, and
 * picks one of the questions tied at that minimum.
 */
const rotateTeamHealthQuestionIds = async (
  questions: readonly {id: number; categoryId: number}[],
  meetingSeriesId: number | undefined
) => {
  const pg = getKysely()

  // tally how many prior meetings in this series have asked each question
  const askCountByQuestionId = new Map<number, number>()
  if (meetingSeriesId !== undefined) {
    const askCounts = await pg
      .selectFrom('TeamHealthResponse')
      .innerJoin('NewMeeting', 'NewMeeting.id', 'TeamHealthResponse.meetingId')
      .where('NewMeeting.meetingSeriesId', '=', meetingSeriesId)
      .select('TeamHealthResponse.questionId')
      .select(({fn}) => fn.count('TeamHealthResponse.meetingId').distinct().as('askCount'))
      .groupBy('TeamHealthResponse.questionId')
      .execute()
    for (const {questionId, askCount} of askCounts) {
      askCountByQuestionId.set(questionId, Number(askCount))
    }
  }

  // rotate questions: within each category, pick 1 of the least-asked so far
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
    const leastAskedQuestions = categoryQuestions.filter(
      (question) => (askCountByQuestionId.get(question.id) ?? 0) === minAskCount
    )
    return leastAskedQuestions[Math.floor(Math.random() * leastAskedQuestions.length)]!
  })

  return selectedQuestions.map((question) => question.id)
}

export default rotateTeamHealthQuestionIds
