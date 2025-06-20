import {
  __END__,
  __START__,
  positionAfter,
  positionBefore,
  positionBetween
} from '../../../../../client/shared/sortOrder'
import getKysely from '../../../../postgres/getKysely'

// the sortOrder coming from the client can't be trusted, so we verify there are no conflicts
// this isn't part of the transaction, so although rare, there could still be a conflict
export const getPageNextSortOrder = async (
  sortOrder: string,
  viewerId: string,
  isPrivate: boolean,
  teamId: string | null,
  parentPageId: number | null
) => {
  const pg = getKysely()
  const buildPeers = () => {
    const query = pg.selectFrom('Page').select('sortOrder')
    if (!teamId && !parentPageId) {
      return query
        .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
        .where('teamId', 'is', null)
        .where('parentPageId', 'is', null)
        .where('PageAccess.userId', '=', viewerId)
        .where('isPrivate', '=', isPrivate)
        .where('deletedBy', 'is', null)
    }
    return query
      .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
      .$if(!!parentPageId, (qb) => qb.where('parentPageId', '=', parentPageId!))
      .where('deletedBy', 'is', null)
  }

  if (sortOrder === __END__) {
    // the __END__ sentinel is used when the client doesn't know the sortOrder, it just wants to insert at the end
    const lastSortOrder = await buildPeers()
      .orderBy('sortOrder', 'desc')
      .limit(1)
      .executeTakeFirst()
    return positionAfter(lastSortOrder?.sortOrder ?? ' ')
  }
  if (sortOrder === __START__) {
    const firstSortOrder = await buildPeers().orderBy('sortOrder').limit(1).executeTakeFirst()
    return positionBefore(firstSortOrder?.sortOrder ?? ' ')
  }
  // Validate sortOrder uniqueness
  const conflicting = await buildPeers()
    .where('sortOrder', '=', sortOrder)
    .limit(1)
    .executeTakeFirst()
  if (!conflicting) return sortOrder

  const [rowBefore, rowAfter] = await Promise.all([
    buildPeers()
      .where('sortOrder', '<', sortOrder)
      .orderBy('sortOrder', 'desc')
      .limit(1)
      .executeTakeFirst(),
    buildPeers().where('sortOrder', '>', sortOrder).orderBy('sortOrder').limit(1).executeTakeFirst()
  ])

  const endPosition = rowBefore || rowAfter
  return endPosition ? positionBetween(sortOrder, endPosition.sortOrder) : positionAfter(sortOrder)
}
