import type {Document} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {applyUpdate, encodeStateAsUpdate, XmlElement} from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {hocuspocus} from '../../hocusPocus'

const withDoc = async (documentName: string, fn: (doc: Document) => void) => {
  const conn = await hocuspocus.openDirectConnection(documentName, {})
  // Always disconnect: a DirectConnection has no idle-timeout safety net, so a skipped
  // disconnect() keeps directConnectionsCount > 0 and leaks the loaded document forever
  try {
    await conn.transact(fn)
  } finally {
    await conn.disconnect()
  }
}

export const addCanonicalPageLink = async (
  documentName: string,
  payload: {
    title?: string
    pageCode: number
    isDatabase: boolean
    append?: boolean
  }
) => {
  const {title, pageCode, isDatabase, append = false} = payload
  await withDoc(documentName, (doc) => {
    const pageLinkBlock = createPageLinkElement(
      pageCode,
      title || '<Untitled>',
      isDatabase
    ) as XmlElement
    const frag = doc.getXmlFragment('default')
    const position = append ? frag.length : 1
    frag.insert(position, [pageLinkBlock])
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
      const pageLink = node as XmlElement<PageLinkBlockAttrs>
      // handleDeletedPageLinks won't try to permanently delete if isMoving == true
      pageLink.setAttribute('isMoving', true)
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

export const fetchUserIdsInSameMeeting = async (documentName: string): Promise<string[]> => {
  const conn = await hocuspocus.openDirectConnection(documentName, {})
  // Always disconnect: a DirectConnection has no idle-timeout safety net, so a skipped
  // disconnect() keeps directConnectionsCount > 0 and leaks the loaded document forever
  try {
    const {document} = conn
    if (!document) return []
    const {awareness} = document
    const connectedClients = awareness.getStates()
    return Array.from(connectedClients.values())
      .map((state) => state?.userId)
      .filter((val): val is string => typeof val === 'string')
  } finally {
    await conn.disconnect()
  }
}

// IMMUTABLE This is used in migrations, so you must either create a new function, or flatten the migrations!
export const applyYjsUpdate = async (documentName: string, payload: {update: Uint8Array}) => {
  const {update} = payload
  await withDoc(documentName, (doc) => {
    applyUpdate(doc, update)
  })
}
export const updateUserMention = async (
  documentName: string,
  payload: {userId: string; preferredName: string}
) => {
  const {userId, preferredName} = payload
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!(yxml instanceof XmlElement)) return false
      return yxml.nodeName === 'pageUserMention' && yxml.getAttribute('id') === userId
    })
    for (const node of walker) {
      const el = node as XmlElement
      if (el.getAttribute('label') !== preferredName) {
        el.setAttribute('label', preferredName)
      }
    }
  })
}

export const replacePageContent = async (documentName: string, payload: {content: JSONContent}) => {
  const {content} = payload
  await withDoc(documentName, (doc) => {
    doc.transact(() => {
      const frag = doc.getXmlFragment('default')
      if (frag.length > 0) {
        frag.delete(0, frag.length)
      }
      const tempDoc = TiptapTransformer.toYdoc(content, 'default', serverTipTapExtensions)
      applyUpdate(doc, encodeStateAsUpdate(tempDoc))
    })
  })
}
