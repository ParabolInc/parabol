import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const editTeamHealthQuestion: MutationResolvers['editTeamHealthQuestion'] = async (
  _source,
  {questionId: clientQuestionId, question},
  {dataLoader}
) => {
  const pg = getKysely()
  const [questionId] = CipherId.fromClient(clientQuestionId)

  // authorship is enforced by the isUserViewer permission rule
  const existing = await dataLoader.get('teamHealthQuestions').loadNonNull(questionId)

  // VALIDATION
  const trimmed = question.trim()
  if (!trimmed) {
    throw new GraphQLError('Question cannot be empty')
  }
  if (trimmed.length > 500) {
    throw new GraphQLError('Question is too long')
  }

  const {packId} = existing
  const hasResponse = await pg
    .selectFrom('TeamHealthResponse')
    .select('id')
    .where('questionId', '=', questionId)
    .limit(1)
    .executeTakeFirst()

  // never answered -> safe to edit in place
  if (!hasResponse) {
    await pg
      .updateTable('TeamHealthQuestion')
      .set({question: trimmed})
      .where('id', '=', questionId)
      .execute()
    dataLoader.get('teamHealthQuestions').clear(questionId)
    dataLoader.get('teamHealthQuestionsByPackId').clear(packId)
    return {questionId, replacedQuestionId: null}
  }

  // answered -> treat as immutable: create a new version, hide the original, and re-point templates
  const {id: newId} = await pg
    .insertInto('TeamHealthQuestion')
    .values({
      packId: existing.packId,
      categoryId: existing.categoryId,
      question: trimmed,
      questionType: existing.questionType,
      createdBy: existing.createdBy
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .updateTable('TeamHealthQuestion')
    .set({replacedBy: newId})
    .where('id', '=', questionId)
    .execute()

  // move every template link from the original question to the new version so templates stay current
  const templateLinks = await pg
    .selectFrom('TeamHealthTemplateQuestion')
    .select('templateId')
    .where('questionId', '=', questionId)
    .execute()
  if (templateLinks.length > 0) {
    await pg.deleteFrom('TeamHealthTemplateQuestion').where('questionId', '=', questionId).execute()
    await pg
      .insertInto('TeamHealthTemplateQuestion')
      .values(templateLinks.map(({templateId}) => ({templateId, questionId: newId})))
      .onConflict((oc) => oc.doNothing())
      .execute()
  }

  dataLoader.get('teamHealthQuestions').clear(questionId)
  dataLoader.get('teamHealthQuestionsByPackId').clear(packId)
  templateLinks.forEach(({templateId}) =>
    dataLoader.get('teamHealthTemplateQuestionsByTemplateId').clear(templateId)
  )

  // both ids are raw, straight from PG; the payload type ciphers them
  return {
    questionId: newId,
    replacedQuestionId: questionId
  }
}

export default editTeamHealthQuestion
