import * as Y from 'yjs'
import {createPageLinkElement} from '../../../../client/shared/tiptap/createPageLinkElement'
import type {PageLinkBlockAttrs} from '../../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {NEW_PAGE_SENTINEL_CODE} from '../constants'
import {handleAddedPageLinks} from '../handleAddedPageLinks'

const mockBacklinks: [fromPageId: number, toPageId: number][] = []
const mockOwnerByPageId = new Map<number, string>()
const mockMovedPageIds: number[] = []
const mockPlacementPings: {blockPageId: number; backlinks: [number, number][]}[] = []

jest.mock('../updateBacklinks', () => ({
  updateBacklinks: async (fromPageId: number, addToPageId?: number | null) => {
    await null
    if (addToPageId) mockBacklinks.push([fromPageId, addToPageId])
  }
}))
jest.mock('../hocusPocusHub', () => ({
  publishSyncedBlockPlacementsChanged: (blockPageId: number) =>
    mockPlacementPings.push({blockPageId, backlinks: [...mockBacklinks]})
}))
jest.mock('../../CipherId', () => ({
  CipherId: {encrypt: (id: number) => id, decrypt: (code: number) => code}
}))
const mockCreateNewPage = jest.fn(async (_options: object) => ({id: NEW_PAGE_ID}))
jest.mock('../createNewPage', () => ({
  createNewPage: (options: object) => mockCreateNewPage(options)
}))
const mockDeletes: {table: string; where: unknown[]}[] = []
jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    deleteFrom: (table: string) => ({
      where: (...where: unknown[]) => ({
        execute: async () => {
          mockDeletes.push({table, where})
        }
      })
    })
  })
}))
const mockRehostSeededAssets = jest.fn()
jest.mock('../rehostExternalAssets', () => ({
  rehostSeededAssets: (...args: unknown[]) => mockRehostSeededAssets(...args)
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
  mockDeletes.length = 0
  mockBacklinks.length = 0
  mockPlacementPings.length = 0
  mockMovedPageIds.length = 0
  mockOwnerByPageId.clear()
  mockCreateNewPage.mockClear()
  mockRehostSeededAssets.mockClear()
})

test('records a backlink when a user links a page', async () => {
  await insertLink(makeLink(LINKED_PAGE_ID, false), asUser(EDITOR_ID))
  expect(mockBacklinks).toEqual([[PARENT_PAGE_ID, LINKED_PAGE_ID]])
  expect(mockPlacementPings).toEqual([])
})

test('tells a synced block its placements changed only after the backlink is written', async () => {
  await insertLink(makeLink(LINKED_PAGE_ID, false, true), asUser(EDITOR_ID))
  expect(mockPlacementPings).toEqual([
    {blockPageId: LINKED_PAGE_ID, backlinks: [[PARENT_PAGE_ID, LINKED_PAGE_ID]]}
  ])
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

test('creates a synced block page with an empty paragraph', async () => {
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

const seedParagraph = {type: 'paragraph', content: [{type: 'text', text: 'Call on-call first'}]}

const makeSeededLink = (pageCode: number, content: unknown) => {
  const link = makeLink(pageCode, true, true)
  link.setAttribute('title', 'Escalation path')
  link.setAttribute('content', content as PageLinkBlockAttrs['content'])
  return link
}

test('seeds a new synced block with the content it carries', async () => {
  const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, [seedParagraph])
  await insertLink(link, asUser(EDITOR_ID))
  expect(mockCreateNewPage).toHaveBeenCalledWith(
    expect.objectContaining({
      isSyncedBlock: true,
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {level: 1},
            content: [{type: 'text', text: 'Escalation path'}]
          },
          seedParagraph
        ]
      }
    })
  )
  expect(link.getAttribute('content')).toBeUndefined()
  expect(link.getAttribute('title')).toBe('')
  expect(link.getAttribute('pageCode')).toBe(NEW_PAGE_ID)
})

test('drops page links from seed content', async () => {
  const pageLink = {type: 'pageLinkBlock', attrs: {pageCode: LINKED_PAGE_ID, title: 'Other'}}
  await insertLink(
    makeSeededLink(NEW_PAGE_SENTINEL_CODE, [seedParagraph, pageLink]),
    asUser(EDITOR_ID)
  )
  const [{content}] = mockCreateNewPage.mock.calls[0] as [{content: {content: unknown[]}}]
  expect(content.content).toEqual([
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Escalation path'}]},
    seedParagraph
  ])
})

test('removes content from a link that is not new', async () => {
  mockOwnerByPageId.set(LINKED_PAGE_ID, EDITOR_ID)
  const link = makeSeededLink(LINKED_PAGE_ID, [seedParagraph])
  await insertLink(link, asUser(EDITOR_ID))
  expect(link.getAttribute('content')).toBeUndefined()
  expect(mockCreateNewPage).not.toHaveBeenCalled()
})

const escalationHeading = {
  type: 'heading',
  attrs: {level: 2},
  content: [{type: 'text', text: 'Escalation path'}]
}

const insertSeededLinkInPage = (seed: unknown) => {
  const {doc, frag} = makePage()
  const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, seed)
  doc.transact(() => {
    frag.insert(0, [link as Y.XmlElement])
  }, asUser(EDITOR_ID))
  return {doc, frag, link}
}

const nodeNames = (frag: Y.XmlFragment) => frag.toArray().map((n) => (n as Y.XmlElement).nodeName)

test('puts the text back when the synced block page cannot be made', async () => {
  mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
  const {frag} = insertSeededLinkInPage([seedParagraph])
  await flush()
  expect(nodeNames(frag)).toEqual(['paragraph'])
  expect(frag.get(0).toString()).toContain('Call on-call first')
})

test("puts a named block's heading back at its own level", async () => {
  mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
  const {frag} = insertSeededLinkInPage([escalationHeading, seedParagraph])
  await flush()
  expect(nodeNames(frag)).toEqual(['heading', 'paragraph'])
  expect((frag.get(0) as Y.XmlElement).getAttribute('level')).toBe(2)
})

test('adds nothing back when the link was undone before the page failed', async () => {
  let rejectMint: (error: Error) => void = () => {}
  mockCreateNewPage.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        rejectMint = reject
      })
  )
  const {doc, frag} = insertSeededLinkInPage([seedParagraph])
  await flush()
  doc.transact(() => frag.delete(0, 1), asUser(EDITOR_ID))
  rejectMint(new Error('boom'))
  await flush()
  expect(frag.length).toBe(0)
})

test('names the block from the heading its seed leads with and keeps the heading inside', async () => {
  insertSeededLinkInPage([escalationHeading, seedParagraph])
  await flush()
  expect(mockCreateNewPage).toHaveBeenCalledWith(
    expect.objectContaining({
      content: {
        type: 'doc',
        content: [
          {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Escalation path'}]},
          escalationHeading,
          seedParagraph
        ]
      }
    })
  )
})

test('rehosts the assets a seed carries into the new page as the inserting user', async () => {
  const image = {type: 'imageBlock', attrs: {src: 'https://tracker.example/pixel.png'}}
  await insertLink(
    makeSeededLink(NEW_PAGE_SENTINEL_CODE, [seedParagraph, image]),
    asUser(EDITOR_ID)
  )
  expect(mockRehostSeededAssets).toHaveBeenCalledWith(
    NEW_PAGE_ID,
    [seedParagraph, {type: 'imageBlock', attrs: expect.objectContaining(image.attrs)}],
    EDITOR_ID
  )
})

const insertThenUndoBeforeMint = async (isSyncedBlock: boolean) => {
  const {doc, frag} = makePage()
  const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, [seedParagraph])
  if (!isSyncedBlock) link.removeAttribute('synced')
  mockCreateNewPage.mockImplementationOnce(async () => {
    doc.transact(() => frag.delete(0, 1), asUser(EDITOR_ID))
    return {id: NEW_PAGE_ID}
  })
  doc.transact(() => {
    frag.insert(0, [link as Y.XmlElement])
  }, asUser(EDITOR_ID))
  const setAttribute = jest.spyOn(link, 'setAttribute')
  await flush()
  return {setAttribute}
}

test('deletes a synced block page outright when its link was undone before the page was made', async () => {
  const {setAttribute} = await insertThenUndoBeforeMint(true)
  expect(mockCreateNewPage).toHaveBeenCalledWith(expect.objectContaining({isSyncedBlock: true}))
  expect(mockDeletes).toEqual([{table: 'Page', where: ['id', '=', NEW_PAGE_ID]}])
  expect(setAttribute).not.toHaveBeenCalled()
  expect(mockRehostSeededAssets).not.toHaveBeenCalled()
  expect(mockBacklinks).toEqual([])
})

test('leaves an ordinary page alone when its link was undone before the page was made', async () => {
  const {setAttribute} = await insertThenUndoBeforeMint(false)
  expect(mockCreateNewPage).toHaveBeenCalledWith(expect.objectContaining({isSyncedBlock: false}))
  expect(mockDeletes).toEqual([])
  expect(setAttribute).toHaveBeenCalledWith('pageCode', NEW_PAGE_ID)
})

test('a malformed seed cannot escape the handler', async () => {
  let seed: unknown = {type: 'paragraph'}
  for (let depth = 0; depth < 20000; depth++) seed = {type: 'blockquote', content: [seed]}
  const unhandled = jest.fn()
  process.on('unhandledRejection', unhandled)
  const {frag, link} = insertSeededLinkInPage([seed])
  await flush()
  process.off('unhandledRejection', unhandled)
  expect(unhandled).not.toHaveBeenCalled()
  expect(link.getAttribute('content')).toBeUndefined()
  expect(frag.length).toBe(1)
})

const makeList = (nodeName: 'bulletList' | 'orderedList', itemTexts: string[]) => {
  const list = new Y.XmlElement(nodeName)
  list.insert(
    0,
    itemTexts.map((text) => {
      const item = new Y.XmlElement('listItem')
      const paragraph = new Y.XmlElement('paragraph')
      paragraph.insert(0, [new Y.XmlText(text)])
      item.insert(0, [paragraph])
      return item
    })
  )
  return list
}

const listItemTexts = (list: Y.XmlElement) =>
  list.toArray().map((item) => (item as Y.XmlElement).get(0).toString())

const seedListItem = (text: string) => ({
  type: 'listItem',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

const insertLinkBetween = (
  before: Y.XmlElement | null,
  link: Y.XmlElement<PageLinkBlockAttrs>,
  after: Y.XmlElement | null
) => {
  const {doc, frag} = makePage()
  doc.transact(() => {
    frag.insert(0, [...(before ? [before] : []), link as Y.XmlElement, ...(after ? [after] : [])])
  }, asUser(EDITOR_ID))
  return frag
}

test('puts a failed list item back in the middle of its list as one list', async () => {
  mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
  const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, [
    {type: 'bulletList', content: [seedListItem('Beta')]}
  ])
  const frag = insertLinkBetween(
    makeList('bulletList', ['Alpha']),
    link,
    makeList('bulletList', ['Gamma'])
  )
  await flush()
  expect(nodeNames(frag)).toEqual(['bulletList'])
  const items = listItemTexts(frag.get(0) as Y.XmlElement)
  expect(items).toHaveLength(3)
  expect(items[0]).toContain('Alpha')
  expect(items[1]).toContain('Beta')
  expect(items[2]).toContain('Gamma')
})

test('puts a failed first list item back at the top of the list that follows', async () => {
  mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
  const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, [
    {type: 'orderedList', content: [seedListItem('One')]}
  ])
  const frag = insertLinkBetween(null, link, makeList('orderedList', ['Two', 'Three']))
  await flush()
  expect(nodeNames(frag)).toEqual(['orderedList'])
  const items = listItemTexts(frag.get(0) as Y.XmlElement)
  expect(items).toHaveLength(3)
  expect(items[0]).toContain('One')
  expect(items[1]).toContain('Two')
  expect(items[2]).toContain('Three')
})

test('leaves the link in place when a seed is too deep to put back', async () => {
  mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
  let seed: unknown = {type: 'paragraph'}
  for (let depth = 0; depth < 1300; depth++) seed = {type: 'blockquote', content: [seed]}
  const unhandled = jest.fn()
  process.on('unhandledRejection', unhandled)
  const {frag, link} = insertSeededLinkInPage([seed])
  await flush()
  process.off('unhandledRejection', unhandled)
  expect(unhandled).not.toHaveBeenCalled()
  expect(frag.length).toBe(1)
  expect(frag.get(0)).toBe(link)
})

test.each(['bulletList', 'orderedList'] as const)(
  'puts a lone failed %s back whole',
  async (listName) => {
    mockCreateNewPage.mockRejectedValueOnce(new Error('boom'))
    const link = makeSeededLink(NEW_PAGE_SENTINEL_CODE, [
      {type: listName, content: [seedListItem('Only'), seedListItem('Two')]}
    ])
    const frag = insertLinkBetween(null, link, null)
    await flush()
    expect(nodeNames(frag)).toEqual([listName])
    const items = listItemTexts(frag.get(0) as Y.XmlElement)
    expect(items).toHaveLength(2)
    expect(items[0]).toContain('Only')
  }
)
