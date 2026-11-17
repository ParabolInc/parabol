import {sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {removeAllBacklinkedPageLinkBlocks} from './hocusPocusHub'

export const trashPageUnderParent = async (
  pageId: number,
  parentPageId: number,
  deletedBy: string | null
) => {
  const {numUpdatedRows} = await getKysely()
    .updateTable('Page')
    .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy})
    .where('id', '=', pageId)
    .where('parentPageId', '=', parentPageId)
    .where('deletedAt', 'is', null)
    .executeTakeFirst()
  if (numUpdatedRows === 0n) return
  await removeAllBacklinkedPageLinkBlocks({pageId})
}
