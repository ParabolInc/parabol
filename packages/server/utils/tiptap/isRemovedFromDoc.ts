import type * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'

export const isRemovedFromDoc = (node: Y.XmlElement<PageLinkBlockAttrs>) =>
  !node.doc || !!node._item?.deleted
