import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'

// XML attributes are stored as a yMap, which gets deleted when the element is deleted
// This uses the undocumented internal yjs _map structure to access those attributes
// It SHOULD be stable until GC, as long as it's called synchronously in the observer callback
export const getUnsafeDeletedAttribute = (
  node: Y.XmlElement<PageLinkBlockAttrs>,
  attr: string,
  isOptional?: boolean
) => {
  const attrMapEntry = node._map?.get(attr)
  if (!attrMapEntry) {
    if (!isOptional) {
      console.error(`[getUnsafeDeletedAttribute]: missing map entry ${attr}`)
    }
    return attrMapEntry
  }
  const val = attrMapEntry.content.getContent()[0]
  if (val === undefined) {
    console.error('[getUnsafeDeletedAttribute]: map entry value is undefined')
  }
  return val
}
