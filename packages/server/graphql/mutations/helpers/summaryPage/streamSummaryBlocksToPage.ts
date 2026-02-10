import {TiptapTransformer} from '@hocuspocus/transformer'
import type {GraphQLResolveInfo} from 'graphql'
import sleep from 'parabol-client/utils/sleep'
import {AbstractType, XmlElement} from 'yjs'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import {hocuspocus, redisHocusPocus} from '../../../../hocusPocus'
import {CipherId} from '../../../../utils/CipherId'
import type {InternalContext} from '../../../graphql'
import {generateMeetingSummaryPage} from './generateMeetingSummaryPage'

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

export const streamSummaryBlocksToPage = async (
  pageId: number,
  meetingId: string,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const contentGenerator = await generateMeetingSummaryPage(meetingId, context, info)
  const documentName = CipherId.toClient(pageId, 'page')
  const unlock = await redisHocusPocus.lockDocument(documentName)
  const conn = await hocuspocus.openDirectConnection(documentName, {})
  let lastBlock: XmlElement
  for await (const rawContent of contentGenerator) {
    if (!rawContent) continue
    const content = rawContent.filter(Boolean)
    if (content.length === 0) continue
    try {
      const tempYDoc = TiptapTransformer.toYdoc(
        {
          type: 'doc',
          content
        },
        undefined,
        serverTipTapExtensions
      )
      const blocks = tempYDoc
        .getXmlFragment('default')
        .toArray()
        .map((block) => cloneBlock(block as XmlElement))

      await conn.transact((doc) => {
        const frag = doc.getXmlFragment('default')
        lastBlock = lastBlock || frag.firstChild
        frag.insertAfter(lastBlock, blocks)
        lastBlock = blocks.at(-1)!
      })
    } catch (e) {
      console.error('Invalid block generated', e, JSON.stringify(content))
    }
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
  unlock()
}
