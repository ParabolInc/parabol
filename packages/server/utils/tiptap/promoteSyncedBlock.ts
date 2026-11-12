import {type Kysely, sql} from 'kysely'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import type {DB} from '../../postgres/types/pg'
import {updatePageAncestorIds} from '../../postgres/updatePageAncestorIds'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {trashPageUnderParent} from './trashPageUnderParent'

const selectPromotableBlock = (db: Kysely<DB>, blockPageId: number, excludedHostIds: number[]) =>
  db
    .selectFrom('Page')
    .select('id')
    .where('id', '=', blockPageId)
    .where('isSyncedBlock', '=', true)
    .where('deletedAt', 'is', null)
    .where('parentPageId', '=', sql<number>`ANY(${excludedHostIds}::int[])`)

export const selectPromotionHost = async (
  db: Kysely<DB>,
  blockPageId: number,
  excludedHostIds: number[]
) => {
  if (excludedHostIds.length === 0) return null
  const block = await selectPromotableBlock(db, blockPageId, excludedHostIds).executeTakeFirst()
  if (!block) return null
  const host = await db
    .selectFrom('PageBacklink as b')
    .innerJoin('Page as h', 'h.id', 'b.fromPageId')
    .select('b.fromPageId')
    .where('b.toPageId', '=', blockPageId)
    .where('h.deletedAt', 'is', null)
    .where('h.id', '<>', blockPageId)
    .where('b.fromPageId', '<>', sql<number>`ALL(${excludedHostIds}::int[])`)
    .where(sql<boolean>`NOT (${blockPageId} = ANY(h."ancestorIds"))`)
    .where(({exists, selectFrom}) =>
      exists(
        selectFrom('PageAccess as hostAccess')
          .innerJoin('PageAccess as blockAccess', 'blockAccess.userId', 'hostAccess.userId')
          .select(sql.lit(1).as('one'))
          .whereRef('hostAccess.pageId', '=', 'h.id')
          .where('hostAccess.role', 'in', ['owner', 'editor'])
          .where('blockAccess.pageId', '=', blockPageId)
      )
    )
    .orderBy('b.createdAt')
    .orderBy('b.fromPageId')
    .limit(1)
    .executeTakeFirst()
  return host?.fromPageId ?? null
}

export const promoteSyncedBlock = async (
  db: Kysely<DB>,
  blockPageId: number,
  excludedHostIds: number[]
) => {
  if (excludedHostIds.length === 0) return null
  const block = await selectPromotableBlock(db, blockPageId, excludedHostIds)
    .forUpdate()
    .executeTakeFirst()
  if (!block) return null
  const hostId = await selectPromotionHost(db, blockPageId, excludedHostIds)
  if (hostId === null) return null
  await db
    .updateTable('Page')
    .set({parentPageId: hostId, isParentLinked: false})
    .where('id', '=', blockPageId)
    .execute()
  await updatePageAncestorIds(db, blockPageId)
  return hostId
}

const markHostLinkCanonical = (hostId: number, blockPageId: number) =>
  redisHocusPocus.handleEvent('markPageLinkCanonical', CipherId.toClient(hostId, 'page'), {
    pageCode: CipherId.encrypt(blockPageId)
  })

const selectBlockOwnerId = async (blockPageId: number) => {
  const owner = await getKysely()
    .selectFrom('PageUserAccess as access')
    .innerJoin('Page', 'Page.id', 'access.pageId')
    .select('access.userId')
    .where('access.pageId', '=', blockPageId)
    .where('access.role', '=', 'owner')
    .orderBy(sql`"access"."userId" = "Page"."userId"`, 'desc')
    .orderBy('access.userId')
    .limit(1)
    .executeTakeFirst()
  return owner?.userId ?? null
}

export const announcePromotedBlock = async (
  hostId: number,
  blockPageId: number,
  excludedHostIds: number[],
  actorId: string | null
) => {
  const triedHostIds = [...excludedHostIds]
  let currentHostId = hostId
  for (;;) {
    let isMarked: boolean | undefined
    try {
      isMarked = await markHostLinkCanonical(currentHostId, blockPageId).catch(() =>
        markHostLinkCanonical(currentHostId, blockPageId)
      )
    } catch (error) {
      Logger.error(error)
      return
    }
    if (isMarked) return
    triedHostIds.push(currentHostId)
    const nextHostId = await getKysely()
      .transaction()
      .execute((trx) => promoteSyncedBlock(trx, blockPageId, triedHostIds))
    if (nextHostId === null) break
    currentHostId = nextHostId
  }
  const ownerId = await selectBlockOwnerId(blockPageId)
  await trashPageUnderParent(blockPageId, currentHostId, ownerId ?? actorId)
}
