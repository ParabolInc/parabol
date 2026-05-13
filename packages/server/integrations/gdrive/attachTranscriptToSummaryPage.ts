import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import {redisHocusPocus} from '../../hocusPocus'
import {CipherId} from '../../utils/CipherId'
import {createNewPage} from '../../utils/tiptap/createNewPage'

export type TranscriptPageInput = {
  title: string
  content: TipTapSerializedPageContent
}

export const attachTranscriptToSummaryPage = async (
  summaryPageId: number,
  pages: TranscriptPageInput[],
  userId: string
) => {
  const documentName = CipherId.toClient(summaryPageId, 'page')
  const dataLoader = getNewDataLoader('attachTranscriptToSummaryPage')
  dataLoader.share()

  try {
    for (const {title, content} of pages) {
      const childPage = await createNewPage(
        {
          parentPageId: summaryPageId,
          content,
          userId
        },
        dataLoader
      )

      const pageCode = CipherId.encrypt(childPage.id)
      await redisHocusPocus.handleEvent('appendPageLinkToPage', documentName, {
        title,
        pageCode,
        isDatabase: false
      })
    }
  } finally {
    dataLoader.dispose()
  }
}
