import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {updatePageAncestorIds} from '../../../postgres/updatePageAncestorIds'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageNotification} from '../../../utils/publishPageNotification'
import {removeAllBacklinkedPageLinkBlocks} from '../../../utils/tiptap/hocusPocusHub'
import {promoteSyncedBlock} from '../../../utils/tiptap/promoteSyncedBlock'
import type {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'

const archivePage: MutationResolvers['archivePage'] = async (
  _source,
  {pageId, action},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const [dbPageId, pageCode] = CipherId.fromClient(pageId)
  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) {
    throw new GraphQLError('Invalid pageId')
  }
  dataLoader.get('pages').clearAll()
  if (page.isMeetingTOC)
    throw new GraphQLError('Meeting Summaries pages cannot be archived or deleted')
  if (action !== 'archive' && !page.deletedAt) {
    throw new GraphQLError('Only pages in the trash can be deleted or restored')
  }
  if (action === 'delete') {
    const subtreeIds = (
      await pg
        .withRecursive('subtree(id)', (qc) =>
          qc
            .selectFrom('Page')
            .select('id')
            .where('parentPageId', '=', dbPageId)
            .union((eb) =>
              eb
                .selectFrom('Page as child')
                .innerJoin('subtree', 'subtree.id', 'child.parentPageId')
                .select('child.id')
            )
        )
        .selectFrom('subtree')
        .select('id')
        .execute()
    ).map(({id}) => id)
    const syncedBlockIds = subtreeIds.length
      ? (
          await pg
            .selectFrom('Page')
            .select('id')
            .where('id', 'in', subtreeIds)
            .where('isSyncedBlock', '=', true)
            .where('deletedAt', '=', (eb) =>
              eb.selectFrom('Page').select('deletedAt').where('id', '=', dbPageId)
            )
            .execute()
        ).map(({id}) => id)
      : []
    const doomedIds = [dbPageId, ...subtreeIds]
    const promotedIds: number[] = []
    for (const blockId of syncedBlockIds) {
      await pg
        .updateTable('Page')
        .set({deletedAt: null, deletedBy: null})
        .where((eb) =>
          eb.or([
            eb('id', '=', blockId),
            eb(sql<boolean>`${blockId} = ANY("ancestorIds")`, '=', true)
          ])
        )
        .execute()
      const hostId = await promoteSyncedBlock(blockId, doomedIds)
      if (hostId !== null) promotedIds.push(blockId)
    }
    const survivingSubtreeIds = subtreeIds.filter((id) => !promotedIds.includes(id))
    const promotedIdsArray = sql<number[]>`ARRAY[${sql.join(promotedIds)}]::int[]`
    // deleting cascades to every sub-page, including restricted ones the viewer may not own
    const subPageOwnedByOthers = survivingSubtreeIds.length
      ? await pg
          .selectFrom('Page')
          .leftJoin('PageAccess', (join) =>
            join.onRef('PageAccess.pageId', '=', 'Page.id').on('PageAccess.userId', '=', viewerId)
          )
          .select('Page.id')
          .where('Page.id', 'in', survivingSubtreeIds)
          .$if(promotedIds.length > 0, (qb) =>
            qb.where(sql<boolean>`NOT ("Page"."ancestorIds" && ${promotedIdsArray})`)
          )
          .where((eb) =>
            eb.or([eb('PageAccess.role', 'is', null), eb('PageAccess.role', '!=', 'owner')])
          )
          .limit(1)
          .executeTakeFirst()
      : undefined
    if (subPageOwnedByOthers) {
      if (promotedIds.length > 0) {
        await pg
          .updateTable('Page')
          .set({deletedAt: page.deletedAt, deletedBy: page.deletedBy})
          .where('id', 'in', promotedIds)
          .execute()
      }
      throw new GraphQLError('This page has sub-pages you do not own, so it cannot be deleted')
    }
    await pg.deleteFrom('Page').where('id', '=', dbPageId).execute()
  } else if (action === 'archive') {
    await pg
      .updateTable('Page')
      .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: viewerId})
      .where('id', '=', dbPageId)
      .execute()
    const documentName = page.parentPageId ? CipherId.toClient(page.parentPageId, 'page') : null
    await Promise.all([
      documentName &&
        redisHocusPocus.handleEvent('removeCanonicalPageLinkFromPage', documentName, {pageCode}),
      // this will also set deletedAt/deletedBy, but there may be a bug that causes it to fail
      removeAllBacklinkedPageLinkBlocks({pageId: dbPageId})
    ])
  } else {
    // When restoring, if the parent no longer exists, promote the orphan to the same level as its greatest ancestor
    let parentPageId: null | undefined
    let teamId: string | undefined
    if (page.parentPageId) {
      const parentPage = await dataLoader.get('pages').load(page.parentPageId)
      if (!parentPage || parentPage.deletedAt) {
        parentPageId = null
        const topLevelAncestorPageId = page.ancestorIds[0]
        if (topLevelAncestorPageId) {
          const topLevelAncestorPage = await dataLoader.get('pages').load(topLevelAncestorPageId)
          teamId = topLevelAncestorPage?.teamId ?? undefined
        }
      } else if (parentPage) {
        // add the canonical page link & let the reconciler take care of the rest
        const documentName = CipherId.toClient(page.parentPageId, 'page')
        await redisHocusPocus.handleEvent('addCanonicalPageLink', documentName, {
          title: page.title || undefined,
          pageCode,
          isDatabase: page.isDatabase,
          isSyncedBlock: page.isSyncedBlock
        })
      }
    }
    const sortOrder = await getPageNextSortOrder(
      page.sortOrder,
      false,
      viewerId,
      page.isPrivate,
      teamId === undefined ? page.teamId : teamId
    )
    await pg
      .updateTable('Page')
      .set({
        deletedAt: null,
        deletedBy: null,
        parentPageId,
        teamId,
        sortOrder
      })
      .where('id', '=', dbPageId)
      .execute()
    if (parentPageId === null) {
      await updatePageAncestorIds(pg, dbPageId)
    }
    if (parentPageId !== undefined || teamId !== undefined) {
      // anytime the parentPageId or teamId changes make sure the mutator maintains access
      await pg
        .insertInto('PageUserAccess')
        .values({
          pageId: dbPageId,
          userId: viewerId,
          role: 'owner'
        })
        .onConflict((oc) =>
          oc.columns(['pageId', 'userId']).doUpdateSet({
            role: 'owner'
          })
        )
        .execute()
    }
  }
  const data = {pageId: dbPageId, action}
  await publishPageNotification(dbPageId, 'ArchivePagePayload', data, subOptions, dataLoader)
  return data
}

export default archivePage
