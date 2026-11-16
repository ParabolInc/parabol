import '../../extensions/__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import * as Y from 'yjs'
import type Atmosphere from '../../../Atmosphere'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../extensions/__tests__/installHappyDom'
import {BlockMoveHistory} from '../../extensions/BlockMoveHistory'
import {providerManager} from '../../providerManager'
import {appendBlocksToFragment} from '../appendBlocksToFragment'
import {type BlockMoveMeta, dispatchBlockMoveDelete} from '../blockMoveUndoStack'
import {childPageCodesIn, isChildPageLink} from '../blockSnapshot'
import {getMovableBlocks} from '../getMovableBlocks'
import {moveBlocksToPage} from '../moveBlocksToPage'
import {trackRange} from '../trackRange'
import {undoBlockMove} from '../undoBlockMove'
import {h, link, normalize, p, rangeOf, read, seed, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
const mockRoles = new Map<number, string>()
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  lookupPageViewerAccess: (_env: unknown, pageCode: number) => mockRoles.get(pageCode)
}))

let mockTargetDoc: Y.Doc
const mockProvider = (authorizedScope: string) => ({
  document: mockTargetDoc,
  authorizedScope,
  hasUnsyncedChanges: false,
  on() {},
  off() {}
})
jest.mock('../../providerManager', () => ({
  providerManager: {
    openSynced: jest.fn(() => Promise.resolve(mockProvider('read-write'))),
    unregister: jest.fn()
  }
}))

const openSynced = jest.mocked(providerManager.openSynced)
const emit = jest.fn()
const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
const HIRING_PLAN = 7
const SERVER = 'server'

let editor: Editor
let sourceFrag: Y.XmlFragment
let targetFrag: Y.XmlFragment
let serverRefuses: boolean
let onServerMove: (() => void) | undefined

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const makeCollabEditor = (ydoc: Y.Doc) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      ...serverTipTapExtensions.map((extension) =>
        extension.name === 'starterKit'
          ? extension.configure({
              document: false,
              undoRedo: false,
              trailingNode: {node: 'paragraph'}
            })
          : extension
      ),
      Collaboration.configure({document: ydoc}),
      BlockMoveHistory.configure({atmosphere})
    ]
  })

const findChildLink = (frag: Y.XmlFragment) =>
  Array.from(frag.createTreeWalker((node) => isChildPageLink(node)))[0] as Y.XmlElement | undefined

const removeChildLink = (frag: Y.XmlFragment) => {
  const node = findChildLink(frag)
  if (!node) return
  frag.doc!.transact(() => {
    const parent = node.parent as Y.XmlFragment
    parent.delete(parent.toArray().indexOf(node), 1)
  }, SERVER)
}

const reparentOnArrival = (arrivedIn: Y.XmlFragment, leftBehind: Y.XmlFragment) => {
  arrivedIn.doc!.on('afterTransaction', (transaction: Y.Transaction) => {
    if (transaction.origin === SERVER) return
    if (!childPageCodesIn(arrivedIn).includes(HIRING_PLAN)) return
    if (!childPageCodesIn(leftBehind).includes(HIRING_PLAN)) return
    queueMicrotask(() => {
      onServerMove?.()
      onServerMove = undefined
      if (!serverRefuses) {
        removeChildLink(leftBehind)
        return
      }
      const node = findChildLink(arrivedIn)
      arrivedIn.doc!.transact(() => node?.setAttribute('canonical', false as never), SERVER)
    })
  })
}

const startPages = (...blocks: JSONContent[]) => {
  sourceFrag = seed(h(1, 'Title'), ...blocks)
  targetFrag = seed(h(1, 'Q3'))
  mockTargetDoc = targetFrag.doc!
  reparentOnArrival(sourceFrag, targetFrag)
  reparentOnArrival(targetFrag, sourceFrag)
  editor = makeCollabEditor(sourceFrag.doc!)
}

type Range = {from: number; to: number}

const moveRange = async ({from, to}: Range, remainingAfterServer: () => Range) => {
  const movable = getMovableBlocks(editor.state.doc, from, to)
  const moved = appendBlocksToFragment(targetFrag, movable.blocks, editor.schema)
  await flushPromises()
  const remaining = remainingAfterServer()
  const meta: BlockMoveMeta = {
    targetPageId: 'page:2',
    targetTitle: 'Q3 Roadmap',
    moved,
    blocks: movable.blocks,
    childPages: movable.childPages
  }
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(remaining.from, remaining.to), meta)
  meta.gap = trackRange(editor, remaining.from, remaining.from)
  return meta
}

const moveParagraphAndChildPage = () => {
  const {from} = rangeOf(editor, 'paragraph', 0)
  const {to} = rangeOf(editor, 'pageLinkBlock', 0)
  return moveRange({from, to}, () => rangeOf(editor, 'paragraph', 0))
}

const sourceBlocks = () => read(sourceFrag)
const lastSnack = () =>
  emit.mock.calls.findLast(([event]) => event === 'addSnackbar')?.[1] as {message: string}

const hiringPlan = link(7, 'Hiring plan', true)

beforeEach(() => {
  emit.mockClear()
  mockRoles.clear()
  serverRefuses = false
})

afterEach(() => {
  if (!editor.isDestroyed) editor.destroy()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('a lone child page moves, and ⌘Z and ⌘⇧Z take it back and forth', async () => {
  startPages(hiringPlan, p('stays'))
  const {from, to} = rangeOf(editor, 'pageLinkBlock', 0)
  const outcome = await moveBlocksToPage({
    session: {
      editor,
      range: trackRange(editor, from, to),
      sourcePageId: 'page:1',
      movable: getMovableBlocks(editor.state.doc, from, to),
      count: 1
    },
    targetPageId: 'page:2',
    targetTitle: 'Q3 Roadmap'
  })
  expect(outcome).toMatchObject({
    result: 'moved',
    meta: {childPages: [{pageCode: 7, title: 'Hiring plan'}]}
  })
  const movedOut = [normalize([h(1, 'Title'), p('stays')]), normalize([h(1, 'Q3'), hiringPlan])]
  const movedBack = [normalize([h(1, 'Title'), hiringPlan, p('stays')]), normalize([h(1, 'Q3')])]
  expect([sourceBlocks(), read(targetFrag)]).toEqual(movedOut)
  editor.commands.undo()
  await flushPromises()
  expect([sourceBlocks(), read(targetFrag)]).toEqual(movedBack)
  editor.commands.redo()
  await flushPromises()
  expect([sourceBlocks(), read(targetFrag)]).toEqual(movedOut)
  editor.commands.undo()
  await flushPromises()
  expect([sourceBlocks(), read(targetFrag)]).toEqual(movedBack)
})

test('⌘Z puts the blocks back, ⌘⇧Z moves them again, and a ⌘Z during that redo undoes it once it lands', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  const pages = () => [sourceBlocks(), read(targetFrag)]
  const movedBack = [
    normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays')]),
    [h(1, 'Q3')]
  ]
  editor.commands.undo()
  await flushPromises()
  expect(pages()).toEqual(movedBack)
  expect(emit).not.toHaveBeenCalled()
  editor.commands.redo()
  await flushPromises()
  expect(pages()).toEqual([
    [h(1, 'Title'), p('stays')],
    normalize([h(1, 'Q3'), p('moved me'), hiringPlan])
  ])
  editor.commands.undo()
  await flushPromises()
  expect(pages()).toEqual(movedBack)
  onServerMove = () => editor.commands.undo()
  editor.commands.redo()
  await flushPromises()
  await flushPromises()
  expect(pages()).toEqual(movedBack)
})

test('the snackbar Undo does the same as ⌘Z', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  const meta = await moveParagraphAndChildPage()
  editor.commands.insertContentAt(editor.state.doc.content.size, p('typed later'))
  await undoBlockMove(editor, meta)
  await flushPromises()
  expect(sourceBlocks()).toEqual(
    normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays'), p('typed later')])
  )
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('a toggle holding the page comes back whole and leaves the target', async () => {
  const notes = toggle('Notes', p('keep'), hiringPlan)
  startPages(notes, p('stays'))
  await moveRange(rangeOf(editor, 'details', 0), () => rangeOf(editor, 'details', 0))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), notes]))
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), notes, p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('an undo refuses a page the viewer no longer owns, changes nothing, and the next ⌘Z undoes the edit before it', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  editor.commands.insertContentAt(editor.state.doc.content.size, p('typed first'))
  await moveParagraphAndChildPage()
  mockRoles.set(7, 'editor')
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays'), p('typed first')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me'), hiringPlan]))
  expect(lastSnack().message).toBe(
    'Couldn’t undo: only its owner can move Hiring plan. Nothing changed.'
  )
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
})

test('an undo refuses a page someone moved off the target since and changes nothing', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  removeChildLink(targetFrag)
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  expect(lastSnack().message).toBe(
    'Couldn’t undo: Hiring plan was moved off Q3 Roadmap since. Nothing changed.'
  )
})

test('an undo whose target is offline changes nothing, says so, and can be tried again', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  openSynced.mockResolvedValueOnce(null)
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(lastSnack().message).toBe(
    'Couldn’t undo: Q3 Roadmap couldn’t be reached. Nothing changed.'
  )
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays')]))
})

test('when the server refuses, the blocks come back, the page stays on the target, and redo is gone', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  serverRefuses = true
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(
    normalize([h(1, 'Title'), p('moved me'), link(7, 'Hiring plan', false), p('stays')])
  )
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), hiringPlan]))
  expect(lastSnack().message).toBe('Moved back here, but Hiring plan stayed on Q3 Roadmap.')
  expect(editor.can().redo()).toBe(false)
})

test('a redo refuses a page the viewer no longer owns', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  editor.commands.undo()
  await flushPromises()
  mockRoles.set(7, 'editor')
  editor.commands.redo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  expect(lastSnack().message).toBe(
    'Couldn’t move: only its owner can move Hiring plan. Nothing changed.'
  )
})

test('a redo keeps the blocks here when the server never takes the page off this page', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  editor.commands.undo()
  await flushPromises()
  jest.useFakeTimers({doNotFake: ['queueMicrotask']})
  try {
    serverRefuses = true
    editor.commands.redo()
    await jest.advanceTimersByTimeAsync(10_000)
    expect(JSON.stringify(sourceBlocks())).toContain('moved me')
    expect(lastSnack().message).toBe(
      'Copied 2 blocks to Q3 Roadmap. Someone was editing them, so the originals stayed here.'
    )
  } finally {
    jest.useRealTimers()
  }
})

test('⌘⇧Z cancels an undo on its way, or redoes the move once the blocks are back', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  editor.commands.undo()
  editor.commands.redo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  onServerMove = () => editor.commands.redo()
  editor.commands.undo()
  await flushPromises()
  await flushPromises()
  expect(onServerMove).toBeUndefined()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me'), hiringPlan]))
})

test('an ordinary undo keeps a block on the target that someone added a sub-page to', async () => {
  startPages(toggle('Notes', p('keep')), p('stays'))
  const {from, to} = rangeOf(editor, 'details', 0)
  const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
  const moved = appendBlocksToFragment(targetFrag, blocks, editor.schema)
  const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
  const subPage = seed(link(9, 'Budget', true))
    .get(0)
    .clone()
  ;((targetFrag.get(1) as Y.XmlElement).get(1) as Y.XmlElement).push([subPage])
  editor.commands.undo()
  await flushPromises()
  expect(read(targetFrag)).toEqual(
    normalize([h(1, 'Q3'), toggle('Notes', p('keep'), link(9, 'Budget', true))])
  )
})
