import {GraphQLError} from 'graphql'
import {positionBefore} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {MutationResolvers} from '../resolverTypes'
import {MAX_PAGE_DEPTH} from './updatePage'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {parentPageId, teamId},
  {authToken, dataLoader}
) => {
  if (parentPageId && teamId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  const viewerId = getUserId(authToken)
  const dbParentPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : undefined
  const [viewer, parentPage] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dbParentPageId ? dataLoader.get('pages').load(dbParentPageId) : null
  ])
  if (dbParentPageId && !parentPage) {
    throw new GraphQLError('Invalid parentPageId')
  }

  if (parentPage && parentPage.ancestorIds.length >= MAX_PAGE_DEPTH) {
    throw new GraphQLError(`Pages can only be nested ${MAX_PAGE_DEPTH} pages deep`, {
      extensions: {code: 'MAX_PAGE_DEPTH_REACHED'}
    })
  }

  const pg = getKysely()
  const topPage = await pg
    .selectFrom('Page')
    .select('sortOrder')
    .innerJoin('PageAccess', 'pageId', 'Page.id')
    .where('PageAccess.userId', '=', viewerId)
    .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
    .$if(!!dbParentPageId, (qb) => qb.where('parentPageId', '=', dbParentPageId!))
    .$if(!dbParentPageId, (qb) => qb.where('parentPageId', 'is', null))
    .$if(!teamId, (qb) => qb.where('isPrivate', '=', true))
    .orderBy('sortOrder')
    .limit(1)
    .executeTakeFirst()
  const sortOrder = positionBefore(topPage?.sortOrder ?? ' ')
  const page = await getKysely()
    .insertInto('Page')
    .values({
      userId: viewerId,
      parentPageId: dbParentPageId,
      ancestorIds: parentPage?.ancestorIds.concat(dbParentPageId!) ?? [],
      teamId,
      sortOrder
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  analytics.pageCreated(viewer, page.id)
  return {page}
}

export default createPage
