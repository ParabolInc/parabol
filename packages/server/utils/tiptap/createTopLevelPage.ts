import {TiptapTransformer} from '@hocuspocus/transformer'
import {type JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {encodeStateAsUpdate} from 'yjs'
import {__START__} from '../../../client/shared/sortOrder'
import {SubscriptionChannel} from '../../../client/types/constEnums'
import type {DataLoaderWorker} from '../../graphql/graphql'
import {getPageNextSortOrder} from '../../graphql/public/mutations/helpers/getPageNextSortOrder'
import getKysely from '../../postgres/getKysely'
import {updatePageAccessTable} from '../../postgres/updatePageAccessTable'
import {analytics} from '../../utils/analytics/analytics'
import publish from '../publish'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'

export const createTopLevelPage = async (
  viewerId: string,
  dataLoader: DataLoaderWorker,
  options: {content?: JSONContent | null; teamId?: string | null; mutatorId?: string | null} = {}
) => {
  const {teamId, content, mutatorId} = options
  const operationId = dataLoader.share()
  const subOptions = {mutatorId: mutatorId || undefined, operationId}
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const pg = getKysely()
  const isPrivate = !teamId
  const sortOrder = await getPageNextSortOrder(__START__, viewerId, isPrivate, teamId || null)
  const yDoc = content
    ? Buffer.from(encodeStateAsUpdate(TiptapTransformer.toYdoc(content)))
    : undefined
  const contentRes = content ? getPlaintextFromTipTap(content) : {}
  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      isPrivate,
      teamId,
      sortOrder,
      yDoc,
      ...contentRes
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
  return page
}
