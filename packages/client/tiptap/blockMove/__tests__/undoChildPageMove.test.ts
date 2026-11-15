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
import {holdsChildPageLink, isChildPageLink} from '../blockSnapshot'
import {getMovableBlocks} from '../getMovableBlocks'
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
const HIRING_PLAN = new Set([7])
const SERVER = 'server'

let editor: Editor
let sourceFrag: Y.XmlFragment
let targetFrag: Y.XmlFragment
let serverRefuses: boolean

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
    if (!holdsChildPageLink(arrivedIn, HIRING_PLAN)) return
    if (!holdsChildPageLink(leftBehind, HIRING_PLAN)) return
    queueMicrotask(() => {
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

test('the move leaves the page and its paragraph on the target', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me'), hiringPlan]))
})

test('⌘Z puts the paragraph and the page back here and the server takes the page off the target', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  expect(emit).not.toHaveBeenCalled()
})

test('⌘⇧Z moves them again, and ⌘Z after that brings them back again', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  editor.commands.undo()
  await flushPromises()
  editor.commands.redo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me'), hiringPlan]))
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('moved me'), hiringPlan, p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('the snackbar Undo does the same as ⌘Z', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  const meta = await moveParagraphAndChildPage()
  editor.commands.insertContentAt(editor.state.doc.content.size, p('typed later'))
  await undoBlockMove(editor, meta, meta.gap!)
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

test('an undo refuses a page the viewer no longer owns and changes nothing', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  mockRoles.set(7, 'editor')
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me'), hiringPlan]))
  expect(lastSnack().message).toBe(
    'Couldn’t undo: only its owner can move Hiring plan. Nothing changed.'
  )
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

test('an undo whose target is offline changes nothing and says so', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  await moveParagraphAndChildPage()
  openSynced.mockResolvedValueOnce(null)
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
  expect(lastSnack().message).toBe(
    'Couldn’t undo: Q3 Roadmap couldn’t be reached. Nothing changed.'
  )
})

test('a refused undo steps past the move, so the next ⌘Z undoes the edit before it', async () => {
  startPages(p('moved me'), hiringPlan, p('stays'))
  editor.commands.insertContentAt(editor.state.doc.content.size, p('typed first'))
  await moveParagraphAndChildPage()
  mockRoles.set(7, 'viewer')
  editor.commands.undo()
  await flushPromises()
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('stays')]))
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

test('an ordinary move still undoes the old way', async () => {
  startPages(p('moved me'), p('stays'))
  const {from, to} = rangeOf(editor, 'paragraph', 0)
  const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
  const moved = appendBlocksToFragment(targetFrag, blocks, editor.schema)
  const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
  editor.commands.undo()
  await flushPromises()
  expect(sourceBlocks()).toEqual(normalize([h(1, 'Title'), p('moved me'), p('stays')]))
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})
