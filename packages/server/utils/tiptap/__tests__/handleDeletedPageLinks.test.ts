import * as Y from 'yjs'
import {createPageLinkElement} from '../../../../client/shared/tiptap/createPageLinkElement'
import {handleDeletedPageLinks} from '../handleDeletedPageLinks'

type PageRow = {id: number; parentPageId: number | null}
type Condition = [column: keyof PageRow, value: unknown]

const mockPages: PageRow[] = []
const mockArchivedPageIds: number[] = []
const mockOwnerByPageId = new Map<number, string>()

const mockUpdatePage = () => {
  const conditions: Condition[] = []
  const run = () => {
    const matches = mockPages.filter((row) =>
      conditions.every(([column, value]) => row[column] === value)
    )
    matches.forEach(({id}) => mockArchivedPageIds.push(id))
    return {numUpdatedRows: BigInt(matches.length)}
  }
  const builder = {
    set: () => builder,
    where: (column: keyof PageRow, _operator: string, value: unknown) => {
      conditions.push([column, value])
      return builder
    },
    execute: async () => [run()],
    executeTakeFirst: async () => run()
  }
  return builder
}

jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({updateTable: () => mockUpdatePage()})
}))
jest.mock('../../../dataloader/pageAccessByUserIdBatchFn', () => ({
  pageAccessByUserIdBatchFn: async (keys: {pageId: number; userId: string}[]) =>
    keys.map(({pageId, userId}) => (mockOwnerByPageId.get(pageId) === userId ? 'owner' : 'editor'))
}))
jest.mock('../../CipherId', () => ({
  CipherId: {encrypt: (id: number) => id, decrypt: (code: number) => code}
}))
jest.mock('../updateBacklinks', () => ({updateBacklinks: async () => {}}))
jest.mock('../hocusPocusHub', () => ({removeAllBacklinkedPageLinkBlocks: jest.fn(async () => {})}))

const PARENT_PAGE_ID = 10
const CHILD_PAGE_ID = 11
const OTHER_PAGE_ID = 20
const OWNER_ID = 'user-owner'
const EDITOR_ID = 'user-editor'

const asUser = (userId: string) => ({source: 'connection', connection: {context: {userId}}})
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const makePage = (pageId: number) => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  frag.observeDeep((events) => {
    events.forEach((event) => handleDeletedPageLinks(event, pageId))
  })
  return {doc, frag}
}

const addAndDeleteLink = async (pageId: number, linkedPageId: number, userId: string) => {
  const {doc, frag} = makePage(pageId)
  doc.transact(() => {
    frag.insert(0, [createPageLinkElement(linkedPageId, 'Linked page', false) as Y.XmlElement])
  }, asUser(userId))
  doc.transact(() => {
    frag.delete(0, 1)
  }, asUser(userId))
  await flush()
}

beforeEach(() => {
  mockPages.length = 0
  mockArchivedPageIds.length = 0
  mockOwnerByPageId.clear()
  mockPages.push({id: CHILD_PAGE_ID, parentPageId: PARENT_PAGE_ID})
  mockOwnerByPageId.set(CHILD_PAGE_ID, OWNER_ID)
})

test('archives the child when its owner deletes its canonical link from the parent', async () => {
  await addAndDeleteLink(PARENT_PAGE_ID, CHILD_PAGE_ID, OWNER_ID)
  expect(mockArchivedPageIds).toEqual([CHILD_PAGE_ID])
})

test('does not archive a page when a canonical link to it is forged into another page', async () => {
  mockOwnerByPageId.set(OTHER_PAGE_ID, EDITOR_ID)
  await addAndDeleteLink(OTHER_PAGE_ID, CHILD_PAGE_ID, EDITOR_ID)
  expect(mockArchivedPageIds).toEqual([])
})

test('does not archive the child when a user who does not own it deletes its link', async () => {
  await addAndDeleteLink(PARENT_PAGE_ID, CHILD_PAGE_ID, EDITOR_ID)
  expect(mockArchivedPageIds).toEqual([])
})

test('does not archive the child when the server removes the link', async () => {
  const {doc, frag} = makePage(PARENT_PAGE_ID)
  doc.transact(() => {
    frag.insert(0, [createPageLinkElement(CHILD_PAGE_ID, 'Linked page', false) as Y.XmlElement])
  }, asUser(OWNER_ID))
  frag.delete(0, 1)
  await flush()
  expect(mockArchivedPageIds).toEqual([])
})
