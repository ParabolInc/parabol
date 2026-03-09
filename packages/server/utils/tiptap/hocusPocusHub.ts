import {DataLoaderWorker} from '../../graphql/graphql'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../Logger'

export const removeAllBacklinkedPageLinkBlocks = async ({pageId}: {pageId: number}) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .innerJoin('Page as fromPage', 'fromPage.id', 'PageBacklink.fromPageId')
    .innerJoin('Page as toPage', 'toPage.id', 'PageBacklink.toPageId')
    .select(['fromPage.publicId as fromPublicId', 'toPage.publicId as toPublicId'])
    .where('PageBacklink.toPageId', '=', pageId)
    .execute()

  await Promise.all(
    backLinks.map(async ({fromPublicId, toPublicId}) => {
      const documentName = `page:${fromPublicId}`
      await redisHocusPocus.handleEvent('removeBacklinkedPageLinkBlocks', documentName, {
        pageCode: toPublicId
      })
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
    .innerJoin('Page as fromPage', 'fromPage.id', 'PageBacklink.fromPageId')
    .innerJoin('Page as toPage', 'toPage.id', 'PageBacklink.toPageId')
    .select(['fromPage.publicId as fromPublicId', 'toPage.publicId as toPublicId'])
    .where('PageBacklink.toPageId', '=', pageId)
    .execute()

  await Promise.all(
    backLinks.map(async ({fromPublicId, toPublicId}) => {
      const documentName = `page:${fromPublicId}`
      await redisHocusPocus.handleEvent('updateBacklinkedPageLinkTitles', documentName, {
        pageCode: toPublicId,
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

  const pages = await dataLoader.get('pages').loadMany(targetPageIds)
  pages.forEach((page) => {
    if (!page || page instanceof Error) return
    const documentName = `page:${page.publicId}`
    const payload = {userId, preferredName}
    redisHocusPocus.handleEvent('updateUserMention', documentName, payload, true).catch(Logger.log)
  })
}
