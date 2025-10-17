import type {Document} from '@hocuspocus/server'
import type {XmlElement} from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import {hocuspocus} from '../../hocusPocus'
import {updateYDocNodes} from './updateYDocNodes'

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
    updateYDocNodes(
      doc,
      'pageLinkBlock',
      {canonical: true, pageCode},
      (_, idx, parent) => {
        parent.delete(idx)
        return 'DONE'
      },
      {maxDepth: 0, ascending: false}
    )
  })
}

export const removeBacklinkedPageLinkBlocks = async (
  documentName: string,
  payload: {pageCode: number}
) => {
  const {pageCode} = payload
  await withDoc(documentName, (doc) => {
    updateYDocNodes(
      doc,
      'pageLinkBlock',
      {pageCode},
      (_, idx, parent) => {
        parent.delete(idx)
      },
      // gotcha: ascending must be false for deletes because Yjs array length will change unlike a JS array
      {ascending: false}
    )
  })
}

export const updateBacklinkedPageLinkTitles = async (
  documentName: string,
  payload: {pageCode: number; title: string}
) => {
  const {pageCode, title} = payload
  await withDoc(documentName, (doc) => {
    updateYDocNodes(doc, 'pageLinkBlock', {pageCode}, (node) => {
      node.setAttribute('title', title)
    })
  })
}

export const fetchUserIdsInSameMeeting = async (documentName: string): Promise<string[]> => {
  const conn = await hocuspocus.openDirectConnection(documentName, {})
  const {document} = conn
  if (!document) return []
  const {awareness} = document
  const connectedClients = awareness.getStates()
  const userIds = Array.from(connectedClients.values())
    .map(({userId}) => userId)
    .filter((val) => typeof val === 'string')
  return userIds
}
