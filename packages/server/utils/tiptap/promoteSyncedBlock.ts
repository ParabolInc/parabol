import {sql} from 'kysely'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {updatePageAncestorIds} from '../../postgres/updatePageAncestorIds'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'

export const promoteSyncedBlock = async (blockPageId: number, excludedHostIds: number[]) => {
  const hostId = await getKysely()
    .transaction()
    .execute(async (trx) => {
      const block = await trx
        .selectFrom('Page')
        .select('id')
        .where('id', '=', blockPageId)
        .where('isSyncedBlock', '=', true)
        .where('deletedAt', 'is', null)
        .where('parentPageId', 'in', excludedHostIds)
        .forUpdate()
        .executeTakeFirst()
      if (!block) return null
      const host = await trx
        .selectFrom('PageBacklink as b')
        .innerJoin('Page as h', 'h.id', 'b.fromPageId')
        .select('b.fromPageId')
        .where('b.toPageId', '=', blockPageId)
        .where('h.deletedAt', 'is', null)
        .where('h.id', '<>', blockPageId)
        .where('b.fromPageId', '<>', sql<number>`ALL(${excludedHostIds}::int[])`)
        .where(sql<boolean>`NOT (${blockPageId} = ANY(h."ancestorIds"))`)
        .orderBy('b.createdAt')
        .orderBy('b.fromPageId')
        .limit(1)
        .executeTakeFirst()
      if (!host) return null
      await trx
        .updateTable('Page')
        .set({parentPageId: host.fromPageId, isParentLinked: false})
        .where('id', '=', blockPageId)
        .execute()
      await updatePageAncestorIds(trx, blockPageId)
      return host.fromPageId
    })
  if (hostId === null) return null
  redisHocusPocus
    .handleEvent('markPageLinkCanonical', CipherId.toClient(hostId, 'page'), {
      pageCode: CipherId.encrypt(blockPageId)
    })
    .catch(Logger.error)
  return hostId
}
