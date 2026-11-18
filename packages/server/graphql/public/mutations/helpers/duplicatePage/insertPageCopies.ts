import {sql, type Transaction} from 'kysely'
import getKysely from '../../../../../postgres/getKysely'
import {insertNewPageAccess} from '../../../../../postgres/insertNewPageAccess'
import type {DB} from '../../../../../postgres/types/pg'
import {updatePageAccessTable} from '../../../../../postgres/updatePageAccessTable'
import type {PageCopy} from './buildPageCopies'
import type {DuplicatePlacement} from './getDuplicatePlacement'

interface Params {
  copies: PageCopy[]
  placement: DuplicatePlacement
  viewerId: string
}

const getRootFields = (placement: DuplicatePlacement) => {
  if (placement.kind === 'parent') {
    return {isPrivate: placement.parent.isPrivate, teamId: null, sortOrder: ''}
  }
  if (placement.kind === 'team') {
    return {isPrivate: false, teamId: placement.teamId, sortOrder: placement.sortOrder}
  }
  return {isPrivate: true, teamId: null, sortOrder: placement.sortOrder}
}

const insertBacklinks = async (trx: Transaction<DB>, copies: PageCopy[]) => {
  const backlinks = copies.flatMap(({id: fromPageId, linkedPageIds}) =>
    linkedPageIds.map((toPageId) => ({fromPageId, toPageId}))
  )
  if (backlinks.length === 0) return
  await sql`
    INSERT INTO "PageBacklink" ("fromPageId", "toPageId")
    SELECT link."fromPageId", link."toPageId"
    FROM unnest(
      ${sql.val(backlinks.map(({fromPageId}) => fromPageId))}::int[],
      ${sql.val(backlinks.map(({toPageId}) => toPageId))}::int[]
    ) AS link("fromPageId", "toPageId")
    JOIN "Page" ON "Page".id = link."toPageId"
    ON CONFLICT DO NOTHING
  `.execute(trx)
}

export const insertPageCopies = async ({copies, placement, viewerId}: Params) => {
  const [root] = copies
  const {isPrivate, teamId, sortOrder} = getRootFields(placement)
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      await trx
        .insertInto('Page')
        .values(
          copies.map((copy) => ({
            id: copy.id,
            userId: viewerId,
            isPrivate,
            teamId: copy === root ? teamId : null,
            sortOrder: copy === root ? sortOrder : '',
            parentPageId: copy.parentPageId,
            ancestorIds: copy.ancestorIds,
            isDatabase: copy.isDatabase,
            yDoc: Buffer.from(copy.yDoc),
            title: copy.title,
            plaintextContent: copy.plaintextContent
          }))
        )
        .execute()
      await insertNewPageAccess(trx, {
        pageIds: copies.map(({id}) => id),
        ownerId: viewerId,
        parentPageId: root!.parentPageId,
        teamId
      })
      await updatePageAccessTable(trx, root!.id, {skipDeleteOld: true})
      await insertBacklinks(trx, copies)
    })
}
