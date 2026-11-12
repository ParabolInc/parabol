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
  default: () => ({
    transaction: () => ({execute: async (run: (trx: object) => unknown) => run({})}),
    updateTable: () => mockUpdatePage(),
    selectFrom: () => {
      let pageId: unknown
      const builder = {
        select: () => builder,
        where: (_column: string, _operator: string, value: unknown) => {
          pageId = value
          return builder
        },
        executeTakeFirst: async () => {
          const page = mockPages.find(({id}) => id === pageId)
          return page && {...page, deletedAt: null, isDatabase: false, isSyncedBlock: true}
        }
      }
      return builder
    }
  })
}))
jest.mock('../../../dataloader/pageAccessByUserIdBatchFn', () => ({
  pageAccessByUserIdBatchFn: async (keys: {pageId: number; userId: string}[]) =>
    keys.map(({pageId, userId}) => (mockOwnerByPageId.get(pageId) === userId ? 'owner' : 'editor'))
}))
jest.mock('../../CipherId', () => ({
  CipherId: {encrypt: (id: number) => id, decrypt: (code: number) => code}
}))
const mockUpdateBacklinks = jest.fn(async (..._args: unknown[]) => {})
const mockAnnounce = jest.fn()
const mockPromote = jest.fn(async (..._args: unknown[]): Promise<number | null> => null)
jest.mock('../updateBacklinks', () => ({
  updateBacklinks: (...args: unknown[]) => mockUpdateBacklinks(...args)
}))
jest.mock('../promoteSyncedBlock', () => ({
  promoteSyncedBlock: (...args: unknown[]) => mockPromote(...args),
  announcePromotedBlock: (...args: unknown[]) => mockAnnounce(...args)
}))
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
  mockUpdateBacklinks.mockClear()
  mockAnnounce.mockClear()
  mockPromote.mockReset()
  mockPromote.mockResolvedValue(null)
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

test('puts the link back where it was when a user who does not own the child deletes it', async () => {
  const {doc, frag} = makePage(PARENT_PAGE_ID)
  doc.transact(() => {
    frag.insert(0, [
      new Y.XmlElement('paragraph'),
      createPageLinkElement(CHILD_PAGE_ID, 'Linked page', false) as Y.XmlElement,
      new Y.XmlElement('paragraph')
    ])
  }, asUser(OWNER_ID))
  doc.transact(() => {
    frag.delete(1, 1)
  }, asUser(EDITOR_ID))
  await flush()
  expect(mockArchivedPageIds).toEqual([])
  expect(frag.toArray().map((node) => (node as Y.XmlElement).nodeName)).toEqual([
    'paragraph',
    'pageLinkBlock',
    'paragraph'
  ])
  expect((frag.get(1) as Y.XmlElement).getAttribute('pageCode')).toBe(CHILD_PAGE_ID)
})

const linkAttrs = (frag: Y.XmlFragment) =>
  frag.toArray().map((node) => {
    const link = node as Y.XmlElement
    return {
      pageCode: link.getAttribute('pageCode'),
      canonical: link.getAttribute('canonical'),
      synced: link.getAttribute('synced')
    }
  })

const syncedLink = (canonical: boolean) => {
  const link = createPageLinkElement(CHILD_PAGE_ID, 'Linked page', false, true)
  link.setAttribute('canonical', canonical)
  return link as Y.XmlElement
}

const removeLink = (
  origin: ReturnType<typeof asUser>,
  attrs: {canonical: boolean},
  pageId = PARENT_PAGE_ID
) => {
  const {doc, frag} = makePage(pageId)
  doc.transact(() => {
    frag.insert(0, [syncedLink(attrs.canonical)])
  }, asUser(OWNER_ID))
  doc.transact(() => {
    frag.delete(0, 1)
  }, origin)
  return {frag}
}

test('promotes instead of trashing when a synced original is removed and copies remain', async () => {
  mockPromote.mockResolvedValueOnce(OTHER_PAGE_ID)
  removeLink(asUser(OWNER_ID), {canonical: true})
  await flush()
  expect(mockPromote).toHaveBeenCalledWith(expect.anything(), CHILD_PAGE_ID, [PARENT_PAGE_ID])
  expect(mockArchivedPageIds).toEqual([])
})

test('promotes for a non-owner editor', async () => {
  mockPromote.mockResolvedValueOnce(OTHER_PAGE_ID)
  const {frag} = removeLink(asUser(EDITOR_ID), {canonical: true})
  await flush()
  expect(mockPromote).toHaveBeenCalled()
  expect(frag.length).toBe(0)
})

test('trashes a synced block when its last reference is removed by the owner', async () => {
  mockPromote.mockResolvedValueOnce(null)
  removeLink(asUser(OWNER_ID), {canonical: true})
  await flush()
  expect(mockArchivedPageIds).toEqual([CHILD_PAGE_ID])
})

test('restores the last link for a non-owner', async () => {
  mockPromote.mockResolvedValueOnce(null)
  const {frag} = removeLink(asUser(EDITOR_ID), {canonical: true})
  await flush()
  expect(mockArchivedPageIds).toEqual([])
  expect(linkAttrs(frag)).toEqual([{pageCode: CHILD_PAGE_ID, canonical: true, synced: true}])
})

test('promotes a copy on the same page in place and keeps the backlink', async () => {
  const {doc, frag} = makePage(PARENT_PAGE_ID)
  doc.transact(() => {
    frag.insert(0, [syncedLink(true), syncedLink(false)])
  }, asUser(OWNER_ID))
  doc.transact(() => {
    frag.delete(0, 1)
  }, asUser(OWNER_ID))
  await flush()
  expect(linkAttrs(frag)).toEqual([{pageCode: CHILD_PAGE_ID, canonical: true, synced: true}])
  expect(mockPromote).not.toHaveBeenCalled()
  expect(mockUpdateBacklinks).not.toHaveBeenCalled()
  expect(mockArchivedPageIds).toEqual([])
})

test('removing a copy only drops the backlink', async () => {
  removeLink(asUser(EDITOR_ID), {canonical: false}, OTHER_PAGE_ID)
  await flush()
  expect(mockUpdateBacklinks).toHaveBeenCalledWith(OTHER_PAGE_ID, null, CHILD_PAGE_ID)
  expect(mockPromote).not.toHaveBeenCalled()
  expect(mockArchivedPageIds).toEqual([])
})

test('an ordinary link claiming to be synced still falls through to the owner check', async () => {
  removeLink(asUser(EDITOR_ID), {canonical: true})
  await flush()
  expect(mockArchivedPageIds).toEqual([])
})

test('removing the last synced link from the page the block lives under promotes it', async () => {
  mockPromote.mockResolvedValueOnce(OTHER_PAGE_ID)
  removeLink(asUser(EDITOR_ID), {canonical: false})
  await flush()
  expect(mockPromote).toHaveBeenCalledWith(expect.anything(), CHILD_PAGE_ID, [PARENT_PAGE_ID])
  expect(mockAnnounce).toHaveBeenCalledWith(
    OTHER_PAGE_ID,
    CHILD_PAGE_ID,
    [PARENT_PAGE_ID],
    EDITOR_ID
  )
  expect(mockArchivedPageIds).toEqual([])
})

test('removing the last synced link from the page the block lives under trashes it when no host remains', async () => {
  removeLink(asUser(OWNER_ID), {canonical: false})
  await flush()
  expect(mockPromote).toHaveBeenCalled()
  expect(mockArchivedPageIds).toEqual([CHILD_PAGE_ID])
})

test('removing a synced copy leaves the block alone while another link to it remains on the page', async () => {
  const {doc, frag} = makePage(PARENT_PAGE_ID)
  doc.transact(() => {
    frag.insert(0, [syncedLink(true), syncedLink(false)])
  }, asUser(OWNER_ID))
  doc.transact(() => {
    frag.delete(1, 1)
  }, asUser(OWNER_ID))
  await flush()
  expect(mockPromote).not.toHaveBeenCalled()
  expect(mockArchivedPageIds).toEqual([])
  expect(linkAttrs(frag)).toEqual([{pageCode: CHILD_PAGE_ID, canonical: true, synced: true}])
})
