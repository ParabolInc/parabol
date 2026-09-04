import averageTeamHealthScore from '../../../utils/averageTeamHealthScore'
import type {DataLoaderWorker} from '../../graphql'

/**
 * This cycle's average Likert score for a question, alongside the score its category earned in the
 * previous cycle. Both the reveal ordering and the results UI read from here so a category's trend
 * is computed one way only. Null means nobody answered (this cycle) or the team has never scored
 * the category before (previous cycle) -- neither is a zero.
 */
const getTeamHealthResultScore = async (
  meetingId: string,
  questionId: number,
  dataLoader: DataLoaderWorker
) => {
  const [responses, question, previousScoreByCategoryId] = await Promise.all([
    dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId),
    dataLoader.get('teamHealthQuestions').loadNonNull(questionId),
    dataLoader.get('previousTeamHealthScoresByMeetingId').load(meetingId)
  ])
  const scores = responses.flatMap((response) =>
    response.questionId === questionId && response.score !== null ? [response.score] : []
  )
  return {
    score: averageTeamHealthScore(scores),
    previousScore: previousScoreByCategoryId.get(question.categoryId) ?? null
  }
}

export default getTeamHealthResultScore
