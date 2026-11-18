import {TiptapTransformer} from '@hocuspocus/transformer'
import * as Y from 'yjs'
import {getPageLinks} from '../../../../../../client/shared/tiptap/getPageLinks'
import {CipherId} from '../../../../../utils/CipherId'
import {NEW_PAGE_SENTINEL_CODE} from '../../../../../utils/tiptap/constants'
import {copyPageDoc} from '../../../../../utils/tiptap/copyPageDoc'
import {getPlaintextFromTipTap} from '../../../../../utils/tiptap/getPlaintextFromTipTap'
import type {ParentPage} from './getDuplicatePlacement'
import type {PageToCopy} from './selectPagesToCopy'

export type PageCopy = {
  id: number
  parentPageId: number | null
  ancestorIds: number[]
  isDatabase: boolean
  yDoc: Uint8Array
  title: string
  plaintextContent: string
  linkedPageIds: number[]
  syncedBlockIds: number[]
}

interface Params {
  pages: PageToCopy[]
  states: Map<number, Uint8Array>
  copyIdBySourceId: Map<number, number>
  hostedSrcs: Map<string, string>
  rootParent: ParentPage | null
}

const readDoc = (state: Uint8Array) => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  return doc
}

const readText = (doc: Y.Doc) => getPlaintextFromTipTap(TiptapTransformer.fromYdoc(doc, 'default'))

const readLinks = (doc: Y.Doc) => {
  const linkedPageIds: number[] = []
  const syncedBlockIds: number[] = []
  for (const link of getPageLinks(doc)) {
    const pageCode = Number(link.getAttribute('pageCode'))
    if (!pageCode || pageCode === NEW_PAGE_SENTINEL_CODE) continue
    const pageId = CipherId.decrypt(pageCode)
    linkedPageIds.push(pageId)
    if (link.getAttribute('synced') === true) syncedBlockIds.push(pageId)
  }
  return {linkedPageIds, syncedBlockIds}
}

export const buildPageCopies = ({
  pages,
  states,
  copyIdBySourceId,
  hostedSrcs,
  rootParent
}: Params): PageCopy[] => {
  const childCodes = new Map(
    [...copyIdBySourceId].map(([sourceId, copyId]) => [
      CipherId.encrypt(sourceId),
      CipherId.encrypt(copyId)
    ])
  )
  const [root] = pages
  const rootTitle = `Copy of ${readText(readDoc(states.get(root!.id)!)).title || 'Untitled'}`
  const copyBySourceId = new Map<number, PageCopy>()
  return pages.map((page) => {
    const isRoot = page === root
    const parent = isRoot ? rootParent : copyBySourceId.get(page.parentPageId!)!
    const yDoc = copyPageDoc(states.get(page.id)!, {
      childCodes,
      assetSrcs: hostedSrcs,
      rootTitle: isRoot ? rootTitle : undefined
    })
    const doc = readDoc(yDoc)
    const copy: PageCopy = {
      id: copyIdBySourceId.get(page.id)!,
      parentPageId: parent?.id ?? null,
      ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [],
      isDatabase: page.isDatabase,
      yDoc,
      ...readText(doc),
      ...readLinks(doc)
    }
    copyBySourceId.set(page.id, copy)
    return copy
  })
}
