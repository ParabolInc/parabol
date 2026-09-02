import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import rotateTeamHealthQuestionIds from './rotateTeamHealthQuestionIds'

/**
 * Rotates one occurrence's questions for a whole group.
 *
 * A group can cover several teams, and every team must answer the same questions in a given
 * occurrence. Letting each meeting rotate for itself cannot produce that, for two reasons:
 * rotateTeamHealthQuestionIds breaks ties at random, so sibling meetings drawing from the same
 * tally still diverge; and the tally itself has to span the group's history, which a single
 * meeting cannot see from its own series. Callers that fan out over a group rotate once here.
 *
 * Returns undefined when the template has no questions, leaving each meeting to rotate for itself.
 */
const rotateSeriesTeamHealthQuestionIds = async (
  templateId: string,
  meetingSeriesIds: readonly number[],
  dataLoader: DataLoaderWorker
) => {
  const templateQuestions = await dataLoader
    .get('teamHealthTemplateQuestionsByTemplateId')
    .load(templateId)
  const questions = (
    await Promise.all(
      templateQuestions.map((tq) => dataLoader.get('teamHealthQuestions').load(tq.questionId))
    )
  ).filter(isValid)
  if (questions.length === 0) return undefined
  return rotateTeamHealthQuestionIds(questions, meetingSeriesIds)
}

export default rotateSeriesTeamHealthQuestionIds
