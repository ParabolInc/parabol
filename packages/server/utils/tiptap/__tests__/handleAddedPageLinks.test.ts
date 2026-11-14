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
const mockCreateNewPage = jest.fn(async (_options: object) => ({id: NEW_PAGE_ID}))
let mockFlagEnabled = false
jest.mock('../createNewPage', () => ({
  createNewPage: (options: object) => mockCreateNewPage(options)
}))
jest.mock('../isSyncedBlocksEnabled', () => ({
  isSyncedBlocksEnabled: async () => mockFlagEnabled
}))
jest.mock('../../../dataloader/getNewDataLoader', () => ({
  getNewDataLoader: () => ({dispose: () => {}})
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

const makeLink = (pageCode: number, canonical: boolean, isSyncedBlock = false) => {
  const link = createPageLinkElement(pageCode, 'Linked page', false, isSyncedBlock)
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
  mockCreateNewPage.mockClear()
  mockFlagEnabled = false
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

const insertSentinelLink = async (isSyncedBlock: boolean) => {
  const link = makeLink(NEW_PAGE_SENTINEL_CODE, true, isSyncedBlock)
  link.setAttribute('title', '')
  await insertLink(link, asUser(EDITOR_ID))
  return link
}

test('creates a synced block page with an empty paragraph when the flag is on', async () => {
  mockFlagEnabled = true
  await insertSentinelLink(true)
  expect(mockCreateNewPage).toHaveBeenCalledWith(
    expect.objectContaining({
      isSyncedBlock: true,
      content: {
        type: 'doc',
        content: [{type: 'heading', attrs: {level: 1}, content: []}, {type: 'paragraph'}]
      }
    })
  )
})

test('creates an ordinary child page and drops synced when the flag is off', async () => {
  mockFlagEnabled = false
  const node = await insertSentinelLink(true)
  expect(mockCreateNewPage).toHaveBeenCalledWith(expect.objectContaining({isSyncedBlock: false}))
  expect(node.getAttribute('synced')).toBeUndefined()
})

const wrapIn = (nodeName: 'details' | 'callout', link: Y.XmlElement<PageLinkBlockAttrs>) => {
  const container = new Y.XmlElement(nodeName)
  if (nodeName === 'callout') {
    container.insert(0, [link as Y.XmlElement])
    return container
  }
  const content = new Y.XmlElement('detailsContent')
  content.insert(0, [new Y.XmlElement('paragraph'), link as Y.XmlElement])
  container.insert(0, [new Y.XmlElement('detailsSummary'), content])
  return container
}

test('moves a child page whose canonical link arrives inside a toggle', async () => {
  mockOwnerByPageId.set(LINKED_PAGE_ID, EDITOR_ID)
  const {doc, frag} = makePage()
  doc.transact(() => {
    frag.insert(0, [wrapIn('details', makeLink(LINKED_PAGE_ID, true))])
  }, asUser(EDITOR_ID))
  await flush()
  expect(mockMovedPageIds).toEqual([LINKED_PAGE_ID])
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, LINKED_PAGE_ID]])
})

test('records a backlink for a plain link nested in a callout', async () => {
  const {doc, frag} = makePage()
  doc.transact(() => {
    frag.insert(0, [wrapIn('callout', makeLink(LINKED_PAGE_ID, false))])
  }, asUser(EDITOR_ID))
  await flush()
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, LINKED_PAGE_ID]])
})

test('turns a refused top-level canonical link into a plain link', async () => {
  const {doc, frag} = makePage()
  doc.transact(() => {
    frag.insert(0, [makeLink(OTHER_PAGE_ID, true) as Y.XmlElement])
  }, asUser(EDITOR_ID))
  await flush()
  expect(frag.length).toBe(1)
  expect((frag.get(0) as Y.XmlElement).getAttribute('canonical')).toBe(false)
})

test('turns a refused nested canonical link into a plain link', async () => {
  const {doc, frag} = makePage()
  const link = makeLink(OTHER_PAGE_ID, true)
  doc.transact(() => {
    frag.insert(0, [wrapIn('details', link)])
  }, asUser(EDITOR_ID))
  await flush()
  expect(link.parent).not.toBeNull()
  expect(link.getAttribute('canonical')).toBe(false)
})

test('keeps a canonical link the server adds when the move would be refused', async () => {
  const {doc, frag} = makePage()
  const link = makeLink(OTHER_PAGE_ID, true)
  doc.transact(() => {
    frag.insert(0, [link as Y.XmlElement])
  }, asServer())
  await flush()
  expect(frag.length).toBe(1)
  expect(link.getAttribute('canonical')).toBe(true)
  expect(mockMovedPageIds).toEqual([])
})
