import type {JSONContent} from '@tiptap/core'
import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {Logger} from '../Logger'
import {isRemovedFromDoc} from './isRemovedFromDoc'
import {toYXmlNodes} from './toYXmlNodes'

const LIST_NODE_NAMES = ['bulletList', 'orderedList', 'taskList']

const getSibling = (parent: Y.XmlFragment, index: number, nodeName: string | null) => {
  if (!nodeName || index < 0 || index >= parent.length) return null
  const sibling = parent.get(index)
  return sibling instanceof Y.XmlElement && sibling.nodeName === nodeName ? sibling : null
}

const buildRestored = (seedContent: JSONContent[]) => {
  const seedNodes = toYXmlNodes(seedContent)
  const [seedList] = seedNodes
  if (
    seedNodes.length === 1 &&
    seedList instanceof Y.XmlElement &&
    LIST_NODE_NAMES.includes(seedList.nodeName)
  ) {
    return {
      listName: seedList.nodeName,
      items: seedList.toArray().map((item) => item.clone() as Y.XmlElement),
      restored: seedNodes.map((seedNode) => seedNode.clone())
    }
  }
  return {listName: null, items: [], restored: seedNodes.map((seedNode) => seedNode.clone())}
}

export const restoreSeed = (node: Y.XmlElement<PageLinkBlockAttrs>, seedContent: JSONContent[]) => {
  const parent = node.parent instanceof Y.XmlFragment ? node.parent : null
  if (seedContent.length === 0 || isRemovedFromDoc(node) || !parent || !node.doc) return
  const index = parent.toArray().findIndex((child) => child === node)
  if (index === -1) return
  let built: ReturnType<typeof buildRestored>
  try {
    built = buildRestored(seedContent)
  } catch (error) {
    Logger.error(error)
    return
  }
  const {listName, items, restored} = built
  node.doc.transact(() => {
    parent.delete(index)
    const left = getSibling(parent, index - 1, listName)
    const right = getSibling(parent, index, listName)
    if (left) {
      left.insert(left.length, items)
      if (right) {
        left.insert(
          left.length,
          right.toArray().map((item) => item.clone() as Y.XmlElement)
        )
        parent.delete(index)
      }
    } else if (right) {
      right.insert(0, items)
    } else {
      parent.insert(index, restored)
    }
  })
}
