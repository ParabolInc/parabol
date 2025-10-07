import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageNotification} from '../../../utils/publishPageNotification'
import {removeAllBacklinkedPageLinkBlocks} from '../../../utils/tiptap/hocusPocusHub'
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
  if (action === 'delete') {
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
          pageCode
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
        ancestorIds:
          parentPageId === null
            ? page.ancestorIds.filter((id) => id !== page.parentPageId)
            : undefined,
        parentPageId,
        teamId,
        sortOrder
      })
      .where('id', '=', dbPageId)
      .execute()
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
