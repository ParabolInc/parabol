import {sql} from 'kysely'
import {__START__} from '../../../../client/shared/sortOrder'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  // In the future, all user-defined pages will have a parent so we can get rid of the code below
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  const pg = getKysely()
  const isPrivate = !teamId
  const sortOrder = await getPageNextSortOrder(__START__, viewerId, isPrivate, teamId || null)
  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      isPrivate,
      teamId,
      sortOrder
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  const {id: pageId} = page
  const viewerAccessPromise = pg
    .insertInto('PageUserAccess')
    .values({userId: viewerId, pageId, role: 'owner'})
    .execute()
  if (teamId) {
    await pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute()
  }
  await viewerAccessPromise
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()
  analytics.pageCreated(viewer, pageId)
  const data = {page}
  const access = await dataLoader.get('pageAccessByPageId').load(pageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'CreatePagePayload', data, subOptions)
  })
  return {page}
}

export default createPage
