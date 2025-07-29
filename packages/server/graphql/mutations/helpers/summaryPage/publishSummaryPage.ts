import {TiptapTransformer} from '@hocuspocus/transformer'
import {sleep} from 'openai/core.mjs'
import {AbstractType, XmlElement} from 'yjs'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import {server} from '../../../../hocusPocus'
import getKysely from '../../../../postgres/getKysely'
import {CipherId} from '../../../../utils/CipherId'
import {createTopLevelPage} from '../../../../utils/tiptap/createTopLevelPage'
import type {DataLoaderWorker} from '../../../graphql'
import {generateRetroMeetingSummaryPage} from './generateRetroMeetingSummaryPage'

// native clone method only clones attributes that are strings
const cloneBlock = (elToClone: XmlElement) => {
  const {nodeName} = elToClone
  const el = new XmlElement(nodeName)
  const attrs = elToClone.getAttributes()
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value as string)
  })
  el.insert(
    0,
    elToClone.toArray().map((item) => (item instanceof AbstractType ? item.clone() : (item as any)))
  )
  return el
}

const streamSummaryBlocksToPage = async (
  pageId: number,
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const contentGenerator = generateRetroMeetingSummaryPage(meetingId, dataLoader)
  const name = CipherId.toClient(pageId, 'page')
  const conn = await server.hocuspocus.openDirectConnection(name, {})
  await conn.transact((doc) => {
    const frag = doc.getXmlFragment('default')
    const el = new XmlElement()
    el.nodeName = 'thinkingBlock'
    frag.push([el])
  })
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
    await conn.transact((doc) => {
      const frag = doc.getXmlFragment('default')
      for (let i = frag.length - 1; i >= 0; i--) {
        const node = frag.get(i) as XmlElement
        if (node.nodeName === 'thinkingBlock') {
          continue
        }
        if (node.length === 0 && ['paragraph', 'heading'].includes(node.nodeName)) {
          // delete tailing empty headings or paragraphs that may have been added by the user
          frag.delete(i)
        } else {
          break
        }
      }
      for (const block of blocks) {
        // insert it before the thinking block
        frag.insert(frag.length - 1, [cloneBlock(block)])
      }
    })
    // not necessary, just to make it look like it is streaming lol
    await sleep(100)
  }
  await conn.transact((doc) => {
    // remove the thinking block now that we're done
    const frag = doc.getXmlFragment('default')
    for (let i = frag.length - 1; i >= 0; i--) {
      const node = frag.get(i) as XmlElement
      if (node.nodeName === 'thinkingBlock') {
        frag.delete(i)
        break
      }
    }
  })
  await conn.disconnect()
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
  await getKysely()
    .updateTable('NewMeeting')
    .set({summaryPageId: pageId})
    .where('id', '=', meetingId)
    .execute()
  meeting.summaryPageId = pageId
  // don't wait for the stream to finish
  streamSummaryBlocksToPage(pageId, meetingId, dataLoader)
  return page
}
