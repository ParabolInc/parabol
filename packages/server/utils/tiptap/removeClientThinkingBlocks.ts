import {isTransactionOrigin} from '@hocuspocus/server'
import * as Y from 'yjs'

// A thinkingBlock makes the page read-only for everyone, so only the summary stream may add one
export const removeClientThinkingBlocks = (e: Y.YEvent<any>) => {
  const {origin} = e.transaction
  if (!isTransactionOrigin(origin) || origin.source !== 'connection') return
  e.changes.added.forEach((item) => {
    const [node] = item.content.getContent()
    if (!(node instanceof Y.XmlElement) || node.nodeName !== 'thinkingBlock') return
    const {parent} = node
    if (!(parent instanceof Y.XmlElement) && !(parent instanceof Y.XmlFragment)) return
    const idx = parent.toArray().indexOf(node)
    if (idx !== -1) parent.delete(idx)
  })
}
