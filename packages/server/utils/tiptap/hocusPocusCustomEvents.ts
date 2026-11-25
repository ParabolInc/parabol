import type {Document} from '@hocuspocus/server'
import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {applyUpdate, encodeStateAsUpdate, XmlElement} from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {getAllNodesAttributesByType} from '../../../client/shared/tiptap/getAllNodesAttributesByType'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {SerializedResourceGrants} from '../../graphql/public/ResourceGrants'
import type {PageContentEditInput} from '../../graphql/public/resolverTypes'
import {hocuspocus} from '../../hocusPocus'
import {applyPageContentEdits} from './applyPageContentEdits'
import {assertReachablePageLinks} from './assertReachablePageLinks'
import {insertCanonicalLink} from './insertCanonicalLink'
import {PAGE_ASSET_ATTRS} from './pageAssetAttrs'
import {setPageLinkTitles} from './setPageLinkTitles'
import {toYXmlNodes} from './toYXmlNodes'
import {validatePageDoc} from './validatePageDoc'

const withDoc = async <T>(
  documentName: string,
  fn: (doc: Document) => T,
  context: {userId?: string; resourceGrants?: SerializedResourceGrants; scopes?: string[]} = {}
) => {
  const conn = await hocuspocus.openDirectConnection(documentName, context)
  let result!: T
  // Always disconnect: a DirectConnection has no idle-timeout safety net, so a skipped
  // disconnect() keeps directConnectionsCount > 0 and leaks the loaded document forever
  try {
    await conn.transact((doc) => {
      result = fn(doc)
    })
  } finally {
    await conn.disconnect()
  }
  return result
}

// A DirectConnection runs the store hooks when it disconnects, so a read uses the loaded doc when there is one
const readDoc = async <T>(documentName: string, fn: (doc: Document) => T) => {
  const loadedDoc = hocuspocus.documents.get(documentName)
  return loadedDoc ? fn(loadedDoc) : withDoc(documentName, fn)
}

export const addCanonicalPageLink = async (
  documentName: string,
  payload: {
    title?: string
    pageCode: number
    isDatabase: boolean
    isSyncedBlock: boolean
    append?: boolean
    afterPageCode?: number
  }
) => {
  const {title, pageCode, isDatabase, isSyncedBlock, append, afterPageCode} = payload
  await withDoc(documentName, (doc) => {
    const pageLinkBlock = createPageLinkElement(
      pageCode,
      title || '<Untitled>',
      isDatabase,
      isSyncedBlock
    ) as XmlElement
    insertCanonicalLink(doc.getXmlFragment('default'), pageLinkBlock, {append, afterPageCode})
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

export const markPageLinkCanonical = async (
  documentName: string,
  payload: {pageCode: number}
): Promise<boolean> => {
  const {pageCode} = payload
  let isMarked = false
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!isPageLink(yxml)) return false
      return yxml.getAttribute('pageCode') === pageCode && yxml.getAttribute('synced') === true
    })
    for (const node of walker) {
      ;(node as XmlElement<PageLinkBlockAttrs>).setAttribute('canonical', true)
      isMarked = true
      break
    }
  })
  return isMarked
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

export const readPageContent = async (documentName: string, _payload: {}): Promise<JSONContent> =>
  readDoc(documentName, (doc) => TiptapTransformer.fromYdoc(doc, 'default') as JSONContent)

export const readPageState = async (
  documentName: string,
  _payload: {}
): Promise<string | undefined> => {
  const doc: Document | undefined = hocuspocus.documents.get(documentName)
  return doc ? Buffer.from(encodeStateAsUpdate(doc)).toString('base64') : undefined
}

export const replaceSyncedBlockWithContent = async (
  documentName: string,
  payload: {pageCode: number; content: JSONContent[] | null}
) => {
  const {pageCode, content} = payload
  const replacements = content ? toYXmlNodes(content) : []
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!isPageLink(yxml)) return false
      return yxml.getAttribute('pageCode') === pageCode && yxml.getAttribute('synced') === true
    })
    const nodes = Array.from(walker)
    for (const node of nodes) {
      const parent = node.parent as XmlElement
      const parentIdx = parent.toArray().findIndex((child) => child === node)
      if (parentIdx === -1) continue
      parent.delete(parentIdx)
      if (replacements.length > 0) {
        parent.insert(
          parentIdx,
          replacements.map((replacement) => replacement.clone())
        )
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
    setPageLinkTitles(doc.getXmlFragment('default'), pageCode, title)
  })
}

export const broadcastSyncedBlockPlacementsChanged = async (documentName: string) => {
  hocuspocus.documents
    .get(documentName)
    ?.broadcastStateless(JSON.stringify({type: 'syncedBlockPlacementsChanged'}))
}

export const replaceAssetSrc = async (
  documentName: string,
  payload: {src: string; hostedSrc: string}
) => {
  const {src, hostedSrc} = payload
  await withDoc(documentName, (doc) => {
    const frag = doc.getXmlFragment('default')
    const walker = frag.createTreeWalker((yxml) => {
      if (!(yxml instanceof XmlElement)) return false
      const attr = PAGE_ASSET_ATTRS.get(yxml.nodeName)
      return !!attr && yxml.getAttribute(attr) === src
    })
    for (const node of Array.from(walker) as XmlElement[]) {
      const attr = PAGE_ASSET_ATTRS.get(node.nodeName)
      if (attr) node.setAttribute(attr, hostedSrc)
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

export const replacePageContent = async (
  documentName: string,
  payload: {
    content: JSONContent
    userId: string
    resourceGrants?: SerializedResourceGrants
    scopes?: string[]
    canChangePageLinks: boolean
    reachablePageCodes: number[]
  }
) => {
  const {content, userId, resourceGrants, scopes, canChangePageLinks, reachablePageCodes} = payload
  await withDoc(
    documentName,
    (doc) => {
      const currentContent = TiptapTransformer.fromYdoc(doc, 'default') as JSONContent
      const pageImageSrcs = getAllNodesAttributesByType<{src?: unknown}>(
        currentContent,
        'imageBlock'
      )
        .map((attrs) => attrs?.src)
        .filter((src): src is string => typeof src === 'string')
      validatePageDoc(content, new Set(pageImageSrcs))
      if (!canChangePageLinks) {
        assertReachablePageLinks(
          currentContent.content ?? [],
          content.content ?? [],
          reachablePageCodes
        )
      }
      // build first: invalid content throws here, before the page is emptied
      const tempDoc = TiptapTransformer.toYdoc(content, 'default', serverTipTapExtensions)
      doc.transact(() => {
        const frag = doc.getXmlFragment('default')
        if (frag.length > 0) {
          frag.delete(0, frag.length)
        }
        applyUpdate(doc, encodeStateAsUpdate(tempDoc))
      })
    },
    {userId, resourceGrants, scopes}
  )
}

export const patchPageContent = async (
  documentName: string,
  payload: {
    edits: PageContentEditInput[]
    userId: string
    resourceGrants?: SerializedResourceGrants
    scopes?: string[]
    canChangePageLinks: boolean
    reachablePageCodes: number[]
  }
) => {
  const {edits, userId, resourceGrants, scopes, canChangePageLinks, reachablePageCodes} = payload
  await withDoc(
    documentName,
    (doc) => applyPageContentEdits(doc, edits, {canChangePageLinks, reachablePageCodes}),
    {userId, resourceGrants, scopes}
  )
}
