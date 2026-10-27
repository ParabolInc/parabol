import * as Y from 'yjs'
import {createPageLinkElement} from '../../../../client/shared/tiptap/createPageLinkElement'
import type {PageLinkBlockAttrs} from '../../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {NEW_PAGE_SENTINEL_CODE} from '../constants'
import {handleAddedPageLinks} from '../handleAddedPageLinks'

const mockBacklinks: [fromPageId: number, toPageId: number][] = []
const mockOwnerByPageId = new Map<number, string>()
const mockMovedPageIds: number[] = []

jest.mock('../updateBacklinks', () => ({
  updateBacklinks: async (fromPageId: number, addToPageId?: number | null) => {
    if (addToPageId) mockBacklinks.push([fromPageId, addToPageId])
  }
}))
jest.mock('../../CipherId', () => ({
  CipherId: {encrypt: (id: number) => id, decrypt: (code: number) => code}
}))
jest.mock('../createNewPage', () => ({
  createNewPage: async () => ({id: NEW_PAGE_ID})
}))
jest.mock('../movePageToNewParent', () => ({
  movePageToNewParent: async (userId: string, pageId: number) => {
    if (pageId === CHILD_PAGE_ID) return
    if (mockOwnerByPageId.get(pageId) !== userId) {
      throw new Error('Full Access required to move a Page to a new parent')
    }
    mockMovedPageIds.push(pageId)
  }
}))

const PARENT_PAGE_ID = 10
const LINKED_PAGE_ID = 20
const OTHER_PAGE_ID = 30
const NEW_PAGE_ID = 40
const CHILD_PAGE_ID = 50
const EDITOR_ID = 'user-editor'

const asUser = (userId: string) => ({source: 'connection', connection: {context: {userId}}})
const asServer = () => ({source: 'local', context: {}})
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const makePage = () => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  frag.observeDeep((events) => {
    events.forEach((event) => handleAddedPageLinks(event, PARENT_PAGE_ID))
  })
  return {doc, frag}
}

const makeLink = (pageCode: number, canonical: boolean) => {
  const link = createPageLinkElement(pageCode, 'Linked page', false)
  link.setAttribute('canonical', canonical)
  return link
}

const insertLink = async (link: Y.XmlElement<PageLinkBlockAttrs>, origin: object) => {
  const {doc, frag} = makePage()
  doc.transact(() => {
    frag.insert(0, [link as Y.XmlElement])
  }, origin)
  await flush()
}

beforeEach(() => {
  mockBacklinks.length = 0
  mockMovedPageIds.length = 0
  mockOwnerByPageId.clear()
})

test('records a backlink when a user links a page', async () => {
  await insertLink(makeLink(LINKED_PAGE_ID, false), asUser(EDITOR_ID))
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, LINKED_PAGE_ID]])
})

test('records a backlink for a canonical link the server adds', async () => {
  await insertLink(makeLink(CHILD_PAGE_ID, true), asServer())
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, CHILD_PAGE_ID]])
})

test('moves the page when its owner pastes its canonical link', async () => {
  mockOwnerByPageId.set(LINKED_PAGE_ID, EDITOR_ID)
  await insertLink(makeLink(LINKED_PAGE_ID, true), asUser(EDITOR_ID))
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, LINKED_PAGE_ID]])
  expect(mockMovedPageIds).toEqual([LINKED_PAGE_ID])
})

test('records a backlink only to the page minted for a new page link', async () => {
  const {doc, frag} = makePage()
  const link = makeLink(NEW_PAGE_SENTINEL_CODE, true)
  doc.transact(() => {
    frag.insert(0, [link as Y.XmlElement])
  }, asUser(EDITOR_ID))
  doc.transact(() => {
    link.setAttribute('pageCode', OTHER_PAGE_ID)
  }, asUser(EDITOR_ID))
  await flush()
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, NEW_PAGE_ID]])
  expect(link.getAttribute('pageCode')).toBe(NEW_PAGE_ID)
})
