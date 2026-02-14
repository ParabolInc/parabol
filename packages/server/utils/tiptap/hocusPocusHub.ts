import {DataLoaderWorker} from '../../graphql/graphql'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'

export const removeAllBacklinkedPageLinkBlocks = async ({pageId}: {pageId: number}) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .select('fromPageId')
    .where('toPageId', '=', pageId)
    .execute()
  const pageCode = CipherId.encrypt(pageId)

  await Promise.all(
    backLinks.map(async ({fromPageId}) => {
      const documentName = CipherId.toClient(fromPageId, 'page')
      await redisHocusPocus.handleEvent('removeBacklinkedPageLinkBlocks', documentName, {pageCode})
    })
  )
}

export const updateAllBacklinkedPageLinkTitles = async ({
  pageId,
  title
}: {
  pageId: number
  title: string
}) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .select('fromPageId')
    .where('toPageId', '=', pageId)
    .execute()
  const pageCode = CipherId.encrypt(pageId)

  await Promise.all(
    backLinks.map(async ({fromPageId}) => {
      const documentName = CipherId.toClient(fromPageId, 'page')
      await redisHocusPocus.handleEvent('updateBacklinkedPageLinkTitles', documentName, {
        pageCode,
        title
      })
    })
  )
}

export const broadcastUserMentionUpdate = async (
  userId: string,
  preferredName: string,
  dataLoader: DataLoaderWorker,
  pageIds?: number[]
) => {
  const targetPageIds =
    pageIds ?? (await dataLoader.get('pageAccessByUserId').load(userId)).map((p) => p.pageId)

  targetPageIds.forEach((pageId) => {
    const documentName = CipherId.toClient(pageId, 'page')
    const payload = {userId, preferredName}
    redisHocusPocus.handleEvent('updateUserMention', documentName, payload, true).catch(Logger.log)
  })
}
