import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'
import type {DataLoaderWorker} from '../../../graphql'

/**
 * Soft-deletes a user-owned TeamHealthCategory once the last live question stops pointing at it.
 * Built-in (aGhostUser) categories are the canonical shared set and are never removed. A no-op when
 * the category still has non-removed questions, is already removed, or is built-in.
 */
const removeOrphanTeamHealthCategory = async (categoryId: number, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const res = await pg
    .updateTable('TeamHealthCategory')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', categoryId)
    .where('userId', '!=', 'aGhostUser')
    .where('removedAt', 'is', null)
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom('TeamHealthQuestion')
            .select('id')
            .whereRef('categoryId', '=', 'TeamHealthCategory.id')
            .where('removedAt', 'is', null)
        )
      )
    )
    .executeTakeFirst()

  if (Number(res.numUpdatedRows) > 0) {
    dataLoader.get('teamHealthCategories').clear(categoryId)
  }
}

export default removeOrphanTeamHealthCategory
