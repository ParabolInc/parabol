import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const addTeamHealthQuestion: MutationResolvers['addTeamHealthQuestion'] = async (
  _source,
  {question},
  {authToken, dataLoader}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)

  // VALIDATION
  const trimmed = question.trim()
  if (!trimmed) {
    throw new GraphQLError('Question cannot be empty')
  }
  if (trimmed.length > 500) {
    throw new GraphQLError('Question is too long')
  }

  // RESOLUTION
  // find-or-create the viewer's personal question pack (one pack per user). The stored name is
  // cosmetic — the client renders the section as "My Questions" keyed on the pack's userId
  const existingPack = await pg
    .selectFrom('TeamHealthQuestionPack')
    .select('id')
    .where('userId', '=', viewerId)
    .executeTakeFirst()
  const {id: packId} =
    existingPack ??
    (await pg
      .insertInto('TeamHealthQuestionPack')
      .values({userId: viewerId, name: 'My Questions'})
      .returning('id')
      .executeTakeFirstOrThrow())

  // new questions default to the built-in Psychological Safety category; the author re-categorizes later
  const {id: categoryId} = await pg
    .selectFrom('TeamHealthCategory')
    .select('id')
    .where('userId', '=', 'aGhostUser')
    .where('name', '=', 'Psychological Safety')
    .where('removedAt', 'is', null)
    .executeTakeFirstOrThrow()

  const {id: questionId} = await pg
    .insertInto('TeamHealthQuestion')
    .values({
      packId,
      categoryId,
      question: trimmed,
      createdBy: viewerId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  dataLoader.get('teamHealthQuestionsByPackId').clear(packId)
  dataLoader.get('teamHealthQuestionPacksByUserId').clear(viewerId)

  // No publish: the acting client updates its own store via the mutation response. The pack is
  // personal to the viewer, so no other editor needs to be notified.
  return {questionId, packId}
}

export default addTeamHealthQuestion
