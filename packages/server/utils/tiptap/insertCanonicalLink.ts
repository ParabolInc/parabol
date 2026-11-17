import type * as Y from 'yjs'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'

export const insertCanonicalLink = (
  frag: Y.XmlFragment,
  link: Y.XmlElement,
  {append = false, afterPageCode}: {append?: boolean; afterPageCode?: number}
) => {
  if (afterPageCode !== undefined) {
    const anchorIdx = frag
      .toArray()
      .findIndex(
        (node) =>
          isPageLink(node) &&
          node.getAttribute('pageCode') === afterPageCode &&
          node.getAttribute('canonical') === true
      )
    if (anchorIdx !== -1) {
      frag.insert(anchorIdx + 1, [link])
      return
    }
    frag.insert(frag.length, [link])
    return
  }
  frag.insert(append ? frag.length : 1, [link])
}
