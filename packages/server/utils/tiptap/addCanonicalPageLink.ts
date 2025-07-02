import type {Document} from '@hocuspocus/server'
import * as Y from 'yjs'
import {type PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {CipherId} from '../CipherId'
import {withDoc} from './withDoc'

const createPageLinkElement = (pageCode: number, title: string) => {
  const el = new Y.XmlElement<PageLinkBlockAttributes>()
  el.nodeName = 'pageLinkBlock'
  el.setAttribute('pageCode', pageCode)
  el.setAttribute('title', title)
  el.setAttribute('canonical', true)
  return el
}
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
