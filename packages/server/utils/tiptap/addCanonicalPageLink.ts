import type {Document} from '@hocuspocus/server'
import * as Y from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import {CipherId} from '../CipherId'
import {withDoc} from './withDoc'
export const addCanonicalPageLink = async (
  parentPageId: number,
  pageId: number,
  title?: string | null
) => {
  const pageCode = CipherId.encrypt(pageId)
  const insertNode = async (doc: Document) => {
    const pageLinkBlock = createPageLinkElement(pageCode, title || '<Untitled>') as Y.XmlElement
    const frag = doc.getXmlFragment('default')
    frag.insert(1, [pageLinkBlock])
  }
  await withDoc(parentPageId, insertNode)
}
