import {XmlElement} from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'

export const isPageLink = (node: unknown): node is XmlElement<PageLinkBlockAttributes> => {
  return node instanceof XmlElement && node.nodeName === 'pageLinkBlock'
}
