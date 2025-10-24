import type {Document} from '@hocuspocus/server'
import {XmlElement} from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {hocuspocus} from '../../hocusPocus'

const withDoc = async (documentName: string, fn: (doc: Document) => void) => {
  const conn = await hocuspocus.openDirectConnection(documentName, {})
  await conn.transact(fn)
  await conn.disconnect()
}

export const addCanonicalPageLink = async (
  documentName: string,
  payload: {
    title?: string
    pageCode: number
  }
) => {
  const {title, pageCode} = payload
  await withDoc(documentName, (doc) => {
    const pageLinkBlock = createPageLinkElement(pageCode, title || '<Untitled>') as XmlElement
    const frag = doc.getXmlFragment('default')
    frag.insert(1, [pageLinkBlock])
  })
}

export const removeCanonicalPageLinkFromPage = async (
  documentName: string,
  payload: {pageCode: number}
) => {
  const {pageCode} = payload
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!isPageLink(yxml)) return false
      return yxml.getAttribute('pageCode') === pageCode && yxml.getAttribute('canonical') === true
    })
    for (const node of walker) {
      const parent = node.parent as XmlElement
      const parentIdx = parent.toArray().findIndex((child) => child === node)
      if (parentIdx !== -1) {
        parent.delete(parentIdx)
        break
      }
    }
  })
}

export const removeBacklinkedPageLinkBlocks = async (
  documentName: string,
  payload: {pageCode: number}
) => {
  const {pageCode} = payload
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!isPageLink(yxml)) return false
      return yxml.getAttribute('pageCode') === pageCode
    })
    // create the array since Yjs length would change upon deletion
    const nodes = Array.from(walker)
    for (const node of nodes) {
      const parent = node.parent as XmlElement
      const parentIdx = parent.toArray().findIndex((child) => child === node)
      if (parentIdx !== -1) {
        parent.delete(parentIdx)
      }
    }
  })
}

export const updateBacklinkedPageLinkTitles = async (
  documentName: string,
  payload: {pageCode: number; title: string}
) => {
  const {pageCode, title} = payload
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!isPageLink(yxml)) return false
      return yxml.getAttribute('pageCode') === pageCode
    })
    for (const node of walker) {
      ;(node as XmlElement).setAttribute('title', title)
    }
  })
}
