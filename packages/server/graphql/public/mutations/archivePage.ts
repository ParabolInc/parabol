import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const archivePage: MutationResolvers['archivePage'] = async (
  _source,
  {pageId, action},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const [dbPageId] = CipherId.fromClient(pageId)
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
  } else {
    // When restoring, if the parent no longer exists, promote the orphan to the same level as its greatest ancestor
    let parentPageId: null | undefined = undefined
    let teamId: string | undefined = undefined
    if (page.parentPageId) {
      const parentPage = await dataLoader.get('pages').load(page.parentPageId)
      if (parentPage?.deletedAt) {
        parentPageId = null
        const topLevelAncestorPageId = page.ancestorIds[0]
        if (topLevelAncestorPageId) {
          const topLevelAncestorPage = await dataLoader.get('pages').load(topLevelAncestorPageId)
          teamId = topLevelAncestorPage?.teamId ?? undefined
        }
      }
    }
    await pg
      .updateTable('Page')
      .set({deletedAt: null, deletedBy: null, parentPageId, teamId})
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
  const access = await dataLoader.get('pageAccessByPageId').load(dbPageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'ArchivePagePayload', data, subOptions)
  })
  return data
}

export default archivePage
