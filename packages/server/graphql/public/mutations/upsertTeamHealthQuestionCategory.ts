import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'
import removeOrphanTeamHealthCategory from './helpers/removeOrphanTeamHealthCategory'

const upsertTeamHealthQuestionCategory: MutationResolvers['upsertTeamHealthQuestionCategory'] =
  async (_source, {questionId: clientQuestionId, category}, {authToken, dataLoader}) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const [questionId] = CipherId.fromClient(clientQuestionId)
    // authorship is enforced by the isUserViewer permission rule
    const question = await dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
    const prevCategoryId = question.categoryId

    // VALIDATION
    const name = category.trim()
    if (!name) {
      throw new GraphQLError('Category name cannot be empty')
    }
    if (name.length > 100) {
      throw new GraphQLError('Category name is too long')
    }

    // RESOLUTION — find-or-create the category (case-insensitive on name). Built-in (aGhostUser)
    // categories are offered in the picker too, so a matching name must link to the existing category
    // rather than spawn a user-owned duplicate. Built-ins are the canonical shared set, so prefer
    // them over a user-owned category of the same name; only genuinely new names create a user category.
    const matches = await pg
      .selectFrom('TeamHealthCategory')
      .select(['id', 'userId'])
      .where('userId', 'in', [viewerId, 'aGhostUser'])
      .where(sql`lower(name)`, '=', name.toLowerCase())
      .where('removedAt', 'is', null)
      .execute()
    const existing =
      matches.find((c) => c.userId === 'aGhostUser') ?? matches.find((c) => c.userId === viewerId)
    let categoryId = existing?.id
    if (!categoryId) {
      const maxSort = await pg
        .selectFrom('TeamHealthCategory')
        .select(({fn}) => fn.max('sortOrder').as('max'))
        .where('userId', '=', viewerId)
        .where('removedAt', 'is', null)
        .executeTakeFirst()
      const sortOrder = Number(maxSort?.max ?? 0) + 1
      const inserted = await pg
        .insertInto('TeamHealthCategory')
        .values({userId: viewerId, name, sortOrder})
        .returning('id')
        .executeTakeFirstOrThrow()
      categoryId = inserted.id
    }

    await pg
      .updateTable('TeamHealthQuestion')
      .set({categoryId})
      .where('id', '=', questionId)
      .execute()

    dataLoader.get('teamHealthQuestions').clear(questionId)
    dataLoader.get('teamHealthCategories').clear(categoryId)

    // clean up the category the question just left, if nothing else references it
    if (prevCategoryId !== categoryId) {
      await removeOrphanTeamHealthCategory(prevCategoryId, dataLoader)
    }

    return {questionId, categoryId}
  }

export default upsertTeamHealthQuestionCategory
