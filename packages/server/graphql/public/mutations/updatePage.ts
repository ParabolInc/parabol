import {GraphQLError} from 'graphql'
import {__END__, positionAfter} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {MutationResolvers} from '../resolverTypes'

const updatePage: MutationResolvers['updatePage'] = async (
  _source,
  {pageId, teamId, sortOrder, parentPageId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const dbPageId = feistelCipher.decrypt(Number(pageId.split(':')[1]))
  const dbParentPageId = parentPageId
    ? feistelCipher.decrypt(Number(parentPageId.split(':')[1]))
    : null
  if (teamId && parentPageId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  let nextSortOrder = sortOrder

  if (sortOrder === __END__) {
    // the __END__ sentinel signifies the client doesn't know the value (because it has not fetched the children)
    // but knows the page goes at the end. e.g. put 1 page in another without knowing the parent's children
    // Note: A top-level shared page cannot use the sentinel! In practice, the client should never need to becuase top-level shared pages are loaded
    const lastSortOrder = await pg
      .selectFrom('Page')
      .select('sortOrder')
      .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
      .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
      .$if(!!dbParentPageId, (qb) => qb.where('parentPageId', '=', dbParentPageId!))
      .$if(!dbParentPageId, (qb) => qb.where('parentPageId', 'is', null))
      .where('PageAccess.userId', '=', viewerId)
      .orderBy('sortOrder', 'desc')
      .limit(1)
      .executeTakeFirst()
    console.log('got last sort order', lastSortOrder, dbParentPageId)
    nextSortOrder = lastSortOrder?.sortOrder ? positionAfter(lastSortOrder.sortOrder) : ' '
  }

  await pg
    .with('PageUserSortOrder', (qc) =>
      // this only fires for top-level shared pages
      qc
        .updateTable('PageUserSortOrder')
        .set({
          sortOrder: nextSortOrder
        })
        .where('userId', '=', viewerId)
        .where('pageId', '=', dbPageId)
    )
    .updateTable('Page')
    .set({
      teamId,
      parentPageId: dbParentPageId,
      sortOrder: nextSortOrder
    })
    .where('id', '=', dbPageId)
    .execute()
  return {pageId: dbPageId}
}

export default updatePage
