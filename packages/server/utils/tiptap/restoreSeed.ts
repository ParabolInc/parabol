import type {JSONContent} from '@tiptap/core'
import type * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {isRemovedFromDoc} from './isRemovedFromDoc'
import {toYXmlNodes} from './toYXmlNodes'

export const restoreSeed = (node: Y.XmlElement<PageLinkBlockAttrs>, seedContent: JSONContent[]) => {
  const parent = node.parent
  if (seedContent.length === 0 || isRemovedFromDoc(node) || !parent || !node.doc) return
  const index = (parent as Y.XmlElement).toArray().indexOf(node as Y.XmlElement)
  if (index === -1) return
  node.doc.transact(() => {
    ;(parent as Y.XmlElement).delete(index)
    ;(parent as Y.XmlElement).insert(
      index,
      toYXmlNodes(seedContent).map((restored) => restored.clone())
    )
  })
}
