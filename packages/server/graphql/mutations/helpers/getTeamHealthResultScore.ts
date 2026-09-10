import averageTeamHealthScore from '../../../utils/averageTeamHealthScore'
import type {DataLoaderWorker} from '../../graphql'

/**
 * This cycle's average Likert score for a question, alongside the scores its category earned in
 * every prior cycle. Both the reveal ordering and the results UI read from here so a category's
 * trend is computed one way only. A null score means nobody answered, not a zero; an empty history
 * means the team has never scored the category before.
 */
const getTeamHealthResultScore = async (
  meetingId: string,
  questionId: number,
  dataLoader: DataLoaderWorker
) => {
  const [responses, question, priorCycles] = await Promise.all([
    dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId),
    dataLoader.get('teamHealthQuestions').loadNonNull(questionId),
    dataLoader.get('priorTeamHealthCyclesByMeetingId').load(meetingId)
  ])
  const {categoryId} = question
  const scores = responses.flatMap((response) =>
    response.questionId === questionId && response.score !== null ? [response.score] : []
  )
  // oldest first, so the history reads left to right into this cycle's score. A cycle where nobody
  // scored this category is left out rather than plotted as a gap
  const scoreHistory = priorCycles
    .flatMap(({endedAt, scoreByCategoryId}) => {
      const score = scoreByCategoryId.get(categoryId)
      return score === undefined ? [] : [{endedAt, score}]
    })
    .reverse()
  return {
    score: averageTeamHealthScore(scores),
    scoreHistory
  }
}

export default getTeamHealthResultScore
