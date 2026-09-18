import {createHash} from 'crypto'
import getKysely from '../../../postgres/getKysely'

const tiebreakHash = (templateId: string, questionId: number) =>
  createHash('sha256').update(`${templateId}:${questionId}`).digest('hex')

/**
 * Picks one question per category for a Team Health meeting, rotating so the
 * least-asked question in each category is favored across the meeting series.
 *
 * For each category it tallies how many prior meetings in the series asked each
 * question (via the TeamHealthResponse table), finds the category minimum, and
 * picks the question tied at that minimum with the lowest hash of (templateId, questionId).
 * The tiebreak is deterministic so a new series' first meeting depends only on the template,
 * which is what lets TeamHealthTemplate.firstMeetingQuestions preview it. Hashing each question on
 * its own keeps that preview stable when unrelated questions are added or removed.
 *
 * Takes several series ids so a group spanning teams rotates against the whole
 * group's history rather than one team's.
 */
const rotateTeamHealthQuestionIds = async (
  questions: readonly {id: number; categoryId: number}[],
  meetingSeriesIds: readonly number[],
  templateId: string
) => {
  const pg = getKysely()

  // tally how many prior meetings in this series have asked each question
  const askCountByQuestionId = new Map<number, number>()
  if (meetingSeriesIds.length > 0) {
    const askCounts = await pg
      .selectFrom('TeamHealthResponse')
      .innerJoin('NewMeeting', 'NewMeeting.id', 'TeamHealthResponse.meetingId')
      .where('NewMeeting.meetingSeriesId', 'in', meetingSeriesIds)
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
    return categoryQuestions
      .filter((question) => (askCountByQuestionId.get(question.id) ?? 0) === minAskCount)
      .map((question) => ({question, hash: tiebreakHash(templateId, question.id)}))
      .reduce((lowest, candidate) => (candidate.hash < lowest.hash ? candidate : lowest)).question
  })

  return selectedQuestions.map((question) => question.id)
}

export default rotateTeamHealthQuestionIds
