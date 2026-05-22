import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../../utils/CipherId'
import {createNewPage} from '../../utils/tiptap/createNewPage'

export type TranscriptPageInput = {
  title: string
  content: TipTapSerializedPageContent
}

export const attachTranscriptToSummaryPage = async (
  summaryPageId: number,
  pages: TranscriptPageInput[],
  userId: string,
  externalId: string
) => {
  const documentName = CipherId.toClient(summaryPageId, 'page')
  for (const {title, content} of pages) {
    const childPage = await createNewPage({
      parentPageId: summaryPageId,
      content,
      userId
    })
    const pageCode = CipherId.encrypt(childPage.id)
    await redisHocusPocus.handleEvent('addCanonicalPageLink', documentName, {
      title,
      pageCode,
      isDatabase: false,
      append: true
    })
  }
  await getKysely()
    .updateTable('ExternalMeetingFile')
    .set({summaryPageId})
    .where('id', '=', externalId)
    .execute()
}
