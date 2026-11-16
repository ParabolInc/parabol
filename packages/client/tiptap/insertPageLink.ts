import type * as Y from 'yjs'
import {getPageLinks} from '../shared/tiptap/getPageLinks'
import {getFragmentAppendIndex} from './getFragmentAppendIndex'

export const insertPageLink = (
  doc: Y.Doc,
  pageLink: Y.XmlElement,
  dropIdx: number | null,
  children = getPageLinks(doc, true)
) => {
  const frag = doc.getXmlFragment('default')
  const isFirst = dropIdx === -1
  const anchor = dropIdx === null ? undefined : children[isFirst ? 0 : dropIdx]
  if (!anchor) {
    frag.insert(isFirst ? 1 : getFragmentAppendIndex(frag), [pageLink])
    return
  }
  const parent = anchor.parent as Y.XmlElement
  const anchorIdx = parent.toArray().findIndex((child) => child === anchor)
  parent.insert(isFirst ? anchorIdx : anchorIdx + 1, [pageLink])
}
