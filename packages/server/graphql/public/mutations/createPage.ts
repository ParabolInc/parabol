import {GraphQLError} from 'graphql'
import {positionBefore} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {parentPageId, teamId},
  {authToken, dataLoader}
) => {
  if (parentPageId && teamId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const dbParentPageId = parentPageId
    ? feistelCipher.decrypt(Number(parentPageId.split(':')[1]))
    : undefined

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
      teamId,
      sortOrder
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  analytics.pageCreated(viewer, page.id)
  return {page}
}

export default createPage
