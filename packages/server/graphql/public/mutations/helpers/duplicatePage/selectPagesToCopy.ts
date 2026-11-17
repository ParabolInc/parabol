import {type ExpressionBuilder, sql} from 'kysely'
import getKysely from '../../../../../postgres/getKysely'
import type {DB} from '../../../../../postgres/types/pg'
import type {ResourceGrants} from '../../../ResourceGrants'

export type PageToCopy = {id: number; parentPageId: number | null; isDatabase: boolean}

interface Params {
  sourcePageId: number
  viewerId: string
  resourceGrants: ResourceGrants | null | undefined
  limit: number
}

const selectCopyTree = async (sourcePageId: number, viewerId: string, limit: number) => {
  const isCopyable = (eb: ExpressionBuilder<DB, 'Page'>) =>
    eb.and([
      eb('Page.deletedAt', 'is', null),
      eb('Page.isSyncedBlock', '=', false),
      eb.exists(
        eb
          .selectFrom('PageAccess')
          .select(sql.lit(1).as('one'))
          .whereRef('PageAccess.pageId', '=', 'Page.id')
          .where('PageAccess.userId', '=', viewerId)
      )
    ])
  const rows = await getKysely()
    .withRecursive('copyTree', (qc) =>
      qc
        .selectFrom('Page')
        .select(['Page.id', 'Page.parentPageId', 'Page.isDatabase', sql<number>`0`.as('depth')])
        .where('Page.id', '=', sourcePageId)
        .where(isCopyable)
        .unionAll(
          qc
            .selectFrom('Page')
            .innerJoin('copyTree', 'copyTree.id', 'Page.parentPageId')
            .select([
              'Page.id',
              'Page.parentPageId',
              'Page.isDatabase',
              sql<number>`"copyTree".depth + 1`.as('depth')
            ])
            .where('Page.isParentLinked', '=', true)
            .where(isCopyable)
        )
    )
    .selectFrom('copyTree')
    .selectAll()
    .limit(limit)
    .execute()
  return rows.sort((a, b) => a.depth - b.depth || a.id - b.id)
}

const keepGrantedSubtrees = async (pages: PageToCopy[], resourceGrants: ResourceGrants) => {
  const keptIds = new Set<number>()
  for (const page of pages) {
    const isUnderKeptParent = page === pages[0] || keptIds.has(page.parentPageId!)
    if (isUnderKeptParent && (await resourceGrants.hasPage(page.id))) keptIds.add(page.id)
  }
  return pages.filter(({id}) => keptIds.has(id))
}

export const selectPagesToCopy = async ({
  sourcePageId,
  viewerId,
  resourceGrants,
  limit
}: Params): Promise<PageToCopy[]> => {
  const tree = await selectCopyTree(sourcePageId, viewerId, limit)
  const pages = tree.map(({id, parentPageId, isDatabase}) => ({id, parentPageId, isDatabase}))
  if (!resourceGrants || resourceGrants.isUnrestricted()) return pages
  return keepGrantedSubtrees(pages, resourceGrants)
}
