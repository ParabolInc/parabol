import {__END__, positionAfter} from '../../../../../client/shared/sortOrder'
import getKysely from '../../../../postgres/getKysely'

export const getPageNextSortOrder = async (
  sortOrder: string,
  viewerId: string,
  teamId: string | null,
  parentPageId: number | null
) => {
  if (sortOrder !== __END__) return sortOrder
  const pg = getKysely()
  // the __END__ sentinel signifies the client doesn't know the value (because it has not fetched the children)
  // but knows the page goes at the end. e.g. put 1 page in another without knowing the parent's children
  // Note: A top-level shared page cannot use the sentinel! In practice, the client should never need to becuase top-level shared pages are loaded
  const lastSortOrder = await pg
    .selectFrom('Page')
    .select('sortOrder')
    .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
    .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
    .$if(!!parentPageId, (qb) => qb.where('parentPageId', '=', parentPageId!))
    .$if(!parentPageId, (qb) => qb.where('parentPageId', 'is', null))
    .where('PageAccess.userId', '=', viewerId)
    .orderBy('sortOrder', 'desc')
    .limit(1)
    .executeTakeFirst()
  return positionAfter(lastSortOrder?.sortOrder ?? ' ')
}
