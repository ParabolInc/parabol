import * as Y from 'yjs'
import {isPageLink} from '../../shared/tiptap/isPageLink'

export const isChildPageLink = (node: unknown): node is Y.XmlElement =>
  isPageLink(node) &&
  node.getAttribute('canonical') === true &&
  Number(node.getAttribute('pageCode')) !== -1

export const childPageCodesIn = (node: unknown): number[] => {
  if (!(node instanceof Y.XmlFragment)) return []
  if (isChildPageLink(node)) return [Number(node.getAttribute('pageCode'))]
  return node.toArray().flatMap(childPageCodesIn)
}

// The server moves child pages by adding and removing their links, so those changes aren't anyone's edit
export const blockSnapshot = (node: unknown): string => {
  if (!(node instanceof Y.XmlElement)) return String(node)
  if (isChildPageLink(node)) return ''
  const attrs = node.getAttributes() as Record<string, unknown>
  const attrString = Object.keys(attrs)
    .sort()
    .map((key) => ` ${key}="${attrs[key]}"`)
    .join('')
  const name = node.nodeName.toLocaleLowerCase()
  return `<${name}${attrString}>${node.toArray().map(blockSnapshot).join('')}</${name}>`
}

export const isBlockEdited = (node: unknown, snapshot: string) =>
  blockSnapshot(node) !== snapshot || childPageCodesIn(node).length > 0
