import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'
import removeOrphanTeamHealthCategory from './helpers/removeOrphanTeamHealthCategory'

const deleteTeamHealthQuestion: MutationResolvers['deleteTeamHealthQuestion'] = async (
  _source,
  {questionId: clientQuestionId},
  {dataLoader}
) => {
  const pg = getKysely()
  const [questionId] = CipherId.fromClient(clientQuestionId)

  // authorship is enforced by the isUserViewer permission rule
  const existing = await dataLoader.get('teamHealthQuestions').loadNonNull(questionId)

  // RESOLUTION
  // soft-delete so historical responses keep resolving the question as asked, and unlink it from
  // every template so it disappears from selections everywhere
  await pg
    .updateTable('TeamHealthQuestion')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', questionId)
    .execute()
  await pg.deleteFrom('TeamHealthTemplateQuestion').where('questionId', '=', questionId).execute()

  dataLoader.get('teamHealthQuestions').clear(questionId)
  dataLoader.get('teamHealthQuestionsByPackId').clear(existing.packId)

  // clean up the question's category if nothing else references it
  await removeOrphanTeamHealthCategory(existing.categoryId, dataLoader)

  // No publish: org packs are shared across teams; the acting client updates its own store via the
  // mutation response, and other editors pick up the removal on their next fetch.
  return {questionId}
}

export default deleteTeamHealthQuestion
