import type * as Y from 'yjs'

export const isRemovedFromDoc = (node: Y.XmlElement<any>) => !node.doc || !!node._item?.deleted
