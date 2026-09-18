import getKysely from '../../../postgres/getKysely'
import pickLeastAskedTeamHealthQuestionIds from './pickLeastAskedTeamHealthQuestionIds'

/**
 * Picks one question per category for a Team Health meeting, rotating so the
 * least-asked question in each category is favored across the meeting series.
 *
 * It tallies how many prior meetings in the series asked each question (via the
 * TeamHealthResponse table) and hands the tally to pickLeastAskedTeamHealthQuestionIds.
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

  return pickLeastAskedTeamHealthQuestionIds(questions, askCountByQuestionId, templateId)
}

export default rotateTeamHealthQuestionIds
