import {XmlElement} from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'

export const isPageLink = (node: unknown): node is XmlElement<PageLinkBlockAttrs> => {
  return node instanceof XmlElement && node.nodeName === 'pageLinkBlock'
}
