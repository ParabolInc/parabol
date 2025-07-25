import {TiptapTransformer} from '@hocuspocus/transformer'
import type {XmlElement} from 'yjs'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import sleep from '../../../../../client/utils/sleep'
import {createTopLevelPage} from '../../../../utils/tiptap/createTopLevelPage'
import {withDoc} from '../../../../utils/tiptap/withDoc'
import type {DataLoaderWorker} from '../../../graphql'
import {generateRetroMeetingSummaryPage} from './generateRetroMeetingSummaryPage'

const streamSummaryBlocksToPage = async (
  pageId: number,
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const contentGenerator = generateRetroMeetingSummaryPage(meetingId, dataLoader)
  await withDoc(pageId, async (doc) => {
    const frag = doc.getXmlFragment('default')
    let idx = 0
    for await (const rawContent of contentGenerator) {
      if (!rawContent) continue
      const content = rawContent.filter(Boolean)
      if (content.length === 0) continue
      const tempYDoc = TiptapTransformer.toYdoc(
        {
          type: 'doc',
          content
        },
        undefined,
        serverTipTapExtensions
      )
      const blocks = tempYDoc.getXmlFragment('default').toArray() as XmlElement[]
      for (const block of blocks) {
        frag.push([block.clone()])
      }
      if (idx++ === 0) {
        // the first block of a new document is going to be an empty title, so delete that
        // after adding the real title
        frag.delete(0)
      }
      await sleep(500)
    }
  })
}

export const publishSummaryPage = async (
  userId: string,
  meetingId: string,
  dataLoader: DataLoaderWorker,
  mutatorId: string | null | undefined
) => {
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting
  // start creating meeting summaries for everyone, feature flag or not
  const page = await createTopLevelPage(userId, dataLoader, {teamId, mutatorId})
  const {id: pageId} = page
  // don't wait for the stream to finish
  streamSummaryBlocksToPage(pageId, meetingId, dataLoader)
  return page
}
