import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'

export const removeAllBacklinkedPageLinkBlocks = async ({pageId}: {pageId: number}) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .select('fromPageId')
    .where('toPageId', '=', pageId)
    .execute()
  const pageCode = CipherId.encrypt(pageId)

  await Promise.all([
    backLinks.map(async ({fromPageId}) => {
      const documentName = CipherId.toClient(fromPageId, 'page')
      await redisHocusPocus.handleEvent(documentName, 'removeBacklinkedPageLinkBlocks', {pageCode})
    })
  ])
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

  await Promise.all([
    backLinks.map(async ({fromPageId}) => {
      const documentName = CipherId.toClient(fromPageId, 'page')
      await redisHocusPocus.handleEvent(documentName, 'updateBacklinkedPageLinkTitles', {
        pageCode,
        title
      })
    })
  ])
}
