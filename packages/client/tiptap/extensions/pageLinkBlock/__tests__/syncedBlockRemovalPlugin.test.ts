import '../../__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import {
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import * as Y from 'yjs'
import syncedBlockPlacesQuery from '../../../../__generated__/SyncedBlockPlacesQuery.graphql'
import type Atmosphere from '../../../../Atmosphere'
import type {Snack} from '../../../../components/Snackbar'
import {dispatchBlockMoveDelete} from '../../../blockMove/blockMoveUndoStack'
import {PageLinkBlock} from '../PageLinkBlock'
import {showSyncedBlockRemovalSnack} from '../showSyncedBlockRemovalSnack'
import type {SyncedBlockRemoval} from '../syncedBlockRemovalPlugin'
import {syncedLink} from './syncedBlockTestHarness'

jest.mock('../PageLinkNodeView', () => ({__esModule: true, PageLinkNodeView: () => null}))

const THIS_PAGE_ID = 'page:1'
const syncedCopy = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}
const otherSyncedLink = {...syncedLink, attrs: {...syncedLink.attrs, pageCode: 9}}

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const mountPage = (
  content: JSONContent[],
  onSyncedBlockRemoved: (removal: SyncedBlockRemoval, editor: Editor) => void
) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      StarterKit,
      PageLinkBlock.extend({addNodeView: null}).configure({
        yDoc: new Y.Doc(),
        pageId: THIS_PAGE_ID,
        onSyncedBlockRemoved
      })
    ],
    content: {type: 'doc', content}
  })

const recordRemovals = (content: JSONContent[]) => {
  const removals: SyncedBlockRemoval[] = []
  const page = mountPage(content, (removal) => removals.push(removal))
  return {page, removals}
}

const linksIn = (page: Editor) => {
  const links: {pos: number; pageCode: number; canonical: boolean}[] = []
  page.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'pageLinkBlock') return
    links.push({pos, pageCode: Number(node.attrs.pageCode), canonical: !!node.attrs.canonical})
  })
  return links
}

const firstLinkPos = (page: Editor) => linksIn(page)[0]!.pos

const deleteLinkAt = (page: Editor, pos: number) => {
  const size = page.state.doc.nodeAt(pos)!.nodeSize
  return page.state.tr.delete(pos, pos + size)
}

test('reports a deleted synced copy once', () => {
  const {page, removals} = recordRemovals([paragraph('Above'), syncedCopy, paragraph('Below')])
  const pos = firstLinkPos(page)
  page.view.dispatch(deleteLinkAt(page, pos))
  page.commands.insertContentAt(1, 'more ')
  expect(removals).toEqual([
    {pageCode: 7, isOriginal: false, attrs: expect.objectContaining({canonical: false}), pos}
  ])
})

test('reports a deleted original with isOriginal true', () => {
  const {page, removals} = recordRemovals([paragraph('Above'), syncedLink, paragraph('Below')])
  const pos = firstLinkPos(page)
  page.view.dispatch(deleteLinkAt(page, pos))
  expect(removals).toMatchObject([{pageCode: 7, isOriginal: true, pos}])
})

test('ignores a synced block moved within the page', () => {
  const {page, removals} = recordRemovals([syncedCopy, paragraph('Middle'), paragraph('End')])
  const pos = firstLinkPos(page)
  const node = page.state.doc.nodeAt(pos)!
  const tr = page.state.tr.insert(page.state.doc.content.size, node)
  tr.delete(pos, pos + node.nodeSize)
  page.view.dispatch(tr)
  expect(linksIn(page)).toHaveLength(1)
  expect(removals).toEqual([])
})

test('ignores removal when another link to the same block stays on the page', () => {
  const {page, removals} = recordRemovals([syncedLink, paragraph('Middle'), syncedCopy])
  const [first] = linksIn(page)
  page.view.dispatch(deleteLinkAt(page, first!.pos))
  expect(linksIn(page)).toHaveLength(1)
  expect(removals).toEqual([])
})

test('ignores transactions tagged as remote or as a block move', () => {
  const {page, removals} = recordRemovals([syncedCopy, paragraph('Middle'), otherSyncedLink])
  const [first] = linksIn(page)
  page.view.dispatch(deleteLinkAt(page, first!.pos).setMeta(ySyncPluginKey, {isChangeOrigin: true}))
  const [second] = linksIn(page)
  dispatchBlockMoveDelete(page, deleteLinkAt(page, second!.pos), null)
  expect(linksIn(page)).toEqual([])
  expect(removals).toEqual([])
})

test('ignores a removal of two synced blocks at once', () => {
  const {page, removals} = recordRemovals([
    paragraph('Above'),
    syncedCopy,
    otherSyncedLink,
    paragraph('Below')
  ])
  const [first, second] = linksIn(page)
  const end = second!.pos + page.state.doc.nodeAt(second!.pos)!.nodeSize
  page.view.dispatch(page.state.tr.delete(first!.pos, end))
  expect(linksIn(page)).toEqual([])
  expect(removals).toEqual([])
})

describe('the removal snack', () => {
  const placesData = {
    public: {
      page: {
        id: 'page:7',
        access: {viewer: 'owner'},
        syncedBlockPlacements: {
          pages: [
            {isOriginal: true, page: {id: THIS_PAGE_ID, title: 'Runbook', deletedAt: null}},
            {isOriginal: false, page: {id: 'page:9', title: 'Handbook', deletedAt: null}}
          ],
          hiddenCount: 0,
          successor: {id: 'page:9', title: 'Handbook'}
        }
      }
    }
  }

  const mountWithSnack = (fetchFromNetwork: jest.Mock, isStoreLoaded: boolean) => {
    const environment = new Environment({
      network: Network.create(fetchFromNetwork),
      store: new Store(new RecordSource())
    })
    if (isStoreLoaded) {
      const operation = createOperationDescriptor(getRequest(syncedBlockPlacesQuery), {
        pageId: 'page:7'
      })
      environment.commitPayload(operation, placesData)
    }
    const emit = jest.fn()
    const atmosphere = Object.assign(environment, {eventEmitter: {emit}}) as unknown as Atmosphere
    const navigate = jest.fn()
    const executeArchive = jest.fn()
    const shown: Promise<void>[] = []
    const page = mountPage(
      [paragraph('Above'), syncedLink, paragraph('Below')],
      (removal, editor) => {
        shown.push(
          showSyncedBlockRemovalSnack({atmosphere, editor, navigate, executeArchive, removal})
        )
      }
    )
    const lastSnack = () =>
      emit.mock.calls.findLast(([event]) => event === 'addSnackbar')?.[1] as Snack | undefined
    return {page, shown, lastSnack, navigate, executeArchive}
  }

  test('undo re-inserts a removed original as a copy', async () => {
    const fetchFromNetwork = jest.fn()
    const {page, shown, lastSnack, navigate} = mountWithSnack(fetchFromNetwork, true)
    const [original] = linksIn(page)
    page.view.dispatch(deleteLinkAt(page, original!.pos))
    await Promise.all(shown)
    const snack = lastSnack()!
    expect(fetchFromNetwork).not.toHaveBeenCalled()
    expect(snack).toMatchObject({
      key: 'SyncedBlockRemoved',
      autoDismiss: 10,
      message: 'Removed here. Still on 1 page.',
      link: {label: 'Handbook', suffix: ' now holds the original.'},
      action: {label: 'Undo'}
    })
    snack.action!.callback()
    snack.onDismiss?.()
    expect(linksIn(page)).toEqual([{pos: original!.pos, pageCode: 7, canonical: false}])
    snack.link!.callback()
    expect(navigate).toHaveBeenCalledWith('/pages/handbook-9')
  })

  test('reads the placements from the network when the store lacks them', async () => {
    const fetchFromNetwork = jest.fn(() => Promise.resolve({data: placesData}))
    const {page, shown, lastSnack} = mountWithSnack(fetchFromNetwork, false)
    const [original] = linksIn(page)
    page.view.dispatch(deleteLinkAt(page, original!.pos))
    await Promise.all(shown)
    expect(fetchFromNetwork).toHaveBeenCalledTimes(1)
    expect(lastSnack()).toMatchObject({message: 'Removed here. Still on 1 page.'})
  })

  test('undo does nothing once the editor is gone', async () => {
    const {page, shown, lastSnack} = mountWithSnack(jest.fn(), true)
    const [original] = linksIn(page)
    page.view.dispatch(deleteLinkAt(page, original!.pos))
    await Promise.all(shown)
    const snack = lastSnack()!
    page.destroy()
    expect(() => snack.action!.callback()).not.toThrow()
  })
})
