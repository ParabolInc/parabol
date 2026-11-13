import '../../extensions/__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import type {Transaction} from '@tiptap/pm/state'
import * as Y from 'yjs'
import {happyWindow} from '../../extensions/__tests__/installHappyDom'
import {type BlockMoveMeta, dispatchBlockMoveDelete} from '../../extensions/BlockMoveHistory'
import {providerManager} from '../../providerManager'
import type {BlockDragSession} from '../blockDragSession'
import {getMovableBlocks} from '../getMovableBlocks'
import {moveBlocksToPage} from '../moveBlocksToPage'
import {trackRange} from '../trackRange'
import {
  destroyEditors,
  extensions,
  h,
  li,
  link,
  makeEditor,
  p,
  rangeOf,
  read,
  seed,
  toggle
} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../extensions/BlockMoveHistory', () => ({
  dispatchBlockMoveDelete: jest.fn(
    (editor: Editor, tr: Transaction, _meta: BlockMoveMeta | null) => {
      editor.view.dispatch(tr)
    }
  ),
  undoBlockMove: jest.fn()
}))
jest.mock('../../providerManager', () => ({
  providerManager: {openSynced: jest.fn(), unregister: jest.fn()}
}))

type UnsyncedListener = (payload: {number: number}) => void

type FakeProvider = {
  authorizedScope: string
  document: Y.Doc
  stuck: boolean
  beforeAck?: () => void
  afterAck?: () => void
  readonly hasUnsyncedChanges: boolean
  on(event: string, listener: UnsyncedListener): void
  off(event: string, listener: UnsyncedListener): void
}

const makeProvider = (document: Y.Doc) => {
  const listeners = new Set<UnsyncedListener>()
  let unsynced = true
  let ackScheduled = false
  const ack = () => {
    provider.beforeAck?.()
    unsynced = false
    listeners.forEach((listener) => {
      listener({number: 0})
    })
    provider.afterAck?.()
  }
  const provider: FakeProvider = {
    authorizedScope: 'read-write',
    document,
    stuck: false,
    get hasUnsyncedChanges() {
      if (unsynced && !ackScheduled && !provider.stuck) {
        ackScheduled = true
        setTimeout(ack, 0)
      }
      return unsynced
    },
    on: (_event, listener) => {
      listeners.add(listener)
    },
    off: (_event, listener) => {
      listeners.delete(listener)
    }
  }
  return provider
}

const openSynced = jest.mocked(providerManager.openSynced)
const unregister = jest.mocked(providerManager.unregister)
const dispatchDelete = jest.mocked(dispatchBlockMoveDelete)

let editor: Editor
let targetFrag: Y.XmlFragment
let provider: FakeProvider

const sessionFor = (activeEditor: Editor, typeName: string, index: number): BlockDragSession => {
  const {from, to} = rangeOf(activeEditor, typeName, index)
  return {
    editor: activeEditor,
    range: trackRange(activeEditor, from, to),
    sourcePageId: 'page:1',
    movable: getMovableBlocks(activeEditor.state.doc, from, to)
  }
}

const paragraphTexts = (activeEditor: Editor) => {
  const texts: string[] = []
  activeEditor.state.doc.descendants((node) => {
    if (node.type.name === 'paragraph') texts.push(node.textContent)
  })
  return texts
}

const nodeNames = (activeEditor: Editor) => {
  const names: string[] = []
  activeEditor.state.doc.forEach((node) => {
    names.push(node.type.name)
  })
  return names
}

const removeFirst = (activeEditor: Editor, typeName: string) => {
  const {from, to} = rangeOf(activeEditor, typeName, 0)
  activeEditor.view.dispatch(activeEditor.state.tr.delete(from, to))
}

beforeEach(() => {
  jest.clearAllMocks()
  targetFrag = seed(h(1, 'Q3'))
  provider = makeProvider(targetFrag.doc!)
  openSynced.mockImplementation(() => Promise.resolve(provider as unknown as HocuspocusProvider))
  editor = makeEditor(p('moved me'), p('stays'))
})

afterEach(() => {
  jest.useRealTimers()
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('appends to the target, then deletes from the source', async () => {
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3 Roadmap'
  })
  expect(outcome.result).toBe('moved')
  expect(read(targetFrag)).toEqual([h(1, 'Q3'), p('moved me')])
  expect(paragraphTexts(editor)).not.toContain('moved me')
})

test('records the move for undo and the appended blocks, and releases the target', async () => {
  const session = sessionFor(editor, 'paragraph', 0)
  const outcome = await moveBlocksToPage({
    session,
    targetPageId: 'page:2',
    targetTitle: 'Q3 Roadmap'
  })
  expect(outcome.meta).toMatchObject({targetPageId: 'page:2', targetTitle: 'Q3 Roadmap'})
  expect(outcome.meta!.blocks).toBe(session.movable.blocks)
  expect(outcome.meta!.moved).toHaveLength(1)
  expect(dispatchDelete).toHaveBeenCalledWith(editor, expect.anything(), outcome.meta)
  expect(outcome.moved).toBe(outcome.meta!.moved)
  expect(unregister).toHaveBeenCalledTimes(1)
  expect(unregister).toHaveBeenCalledWith('page:2')
})

test('tracks the gap the move left so undo can put the block back there', async () => {
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  const stays = rangeOf(editor, 'paragraph', 0)
  expect(paragraphTexts(editor)[0]).toBe('stays')
  expect(outcome.gap!.current()).toEqual({from: stays.from, to: stays.from})
})

test('stops tracking the dragged range when it finishes', async () => {
  const session = sessionFor(editor, 'paragraph', 0)
  const stop = jest.spyOn(session.range, 'stop')
  await moveBlocksToPage({session, targetPageId: 'page:2', targetTitle: 'Q3'})
  expect(stop).toHaveBeenCalled()
})

test('removes the whole list when its only item moves', async () => {
  const editor = makeEditor({type: 'bulletList', content: [li('only')]}, p('after'))
  await moveBlocksToPage({
    session: sessionFor(editor, 'listItem', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(nodeNames(editor)).toEqual(['heading', 'paragraph'])
})

test('leaves the source alone and reverts the target when the target never saves', async () => {
  jest.useFakeTimers()
  provider.stuck = true
  const pending = moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  await jest.advanceTimersByTimeAsync(10_000)
  expect((await pending).result).toBe('unsaved')
  expect(read(targetFrag)).toEqual([h(1, 'Q3')])
  expect(paragraphTexts(editor)).toContain('moved me')
  expect(unregister).toHaveBeenCalledTimes(1)
  expect((await pending).moved).toBeNull()
})

test('keeps the original when someone edits it during the move', async () => {
  provider.beforeAck = () =>
    editor.commands.insertContentAt(rangeOf(editor, 'paragraph', 0).from + 1, 'x')
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(outcome).toMatchObject({result: 'copied', meta: null, gap: null})
  expect(paragraphTexts(editor)).toContain('xmoved me')
  expect(read(targetFrag)).toEqual([h(1, 'Q3'), p('moved me')])
  expect(outcome.moved).toHaveLength(1)
  expect(unregister).toHaveBeenCalledTimes(1)
})

test.each([
  [
    'readonly',
    () => {
      provider.authorizedScope = 'readonly'
    }
  ],
  [
    'streaming',
    () => {
      targetFrag.insert(1, [new Y.XmlElement('thinkingBlock')])
    }
  ]
] as const)('refuses a %s target and changes nothing', async (result, arrange) => {
  arrange()
  const before = targetFrag.toString()
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(outcome.result).toBe(result)
  expect(paragraphTexts(editor)).toContain('moved me')
  expect(targetFrag.toString()).toBe(before)
  expect(unregister).toHaveBeenCalledTimes(1)
})

test('refuses a target with a thinking block nested below the top level', async () => {
  const quote = new Y.XmlElement('blockquote')
  targetFrag.insert(1, [quote])
  quote.insert(0, [new Y.XmlElement('thinkingBlock')])
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(outcome.result).toBe('streaming')
})

test('reports offline when the target never syncs', async () => {
  openSynced.mockResolvedValueOnce(null)
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'paragraph', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(outcome.result).toBe('offline')
  expect(paragraphTexts(editor)).toContain('moved me')
  expect(unregister).not.toHaveBeenCalled()
})

test('cancels quietly when a collaborator deleted the block mid-drag', async () => {
  const session = sessionFor(editor, 'paragraph', 0)
  const {from, to} = session.range.current()!
  editor.view.dispatch(editor.state.tr.delete(from, to))
  const outcome = await moveBlocksToPage({session, targetPageId: 'page:2', targetTitle: 'Q3'})
  expect(outcome.result).toBe('gone')
  expect(read(targetFrag)).toEqual([h(1, 'Q3')])
  expect(openSynced).not.toHaveBeenCalled()
})

test('cancels without appending when the block is deleted while the target opens', async () => {
  const session = sessionFor(editor, 'paragraph', 0)
  openSynced.mockImplementationOnce(() => {
    const {from, to} = session.range.current()!
    editor.view.dispatch(editor.state.tr.delete(from, to))
    return Promise.resolve(provider as unknown as HocuspocusProvider)
  })
  const outcome = await moveBlocksToPage({session, targetPageId: 'page:2', targetTitle: 'Q3'})
  expect(outcome).toMatchObject({result: 'gone', meta: null, gap: null, moved: null})
  expect(read(targetFrag)).toEqual([h(1, 'Q3')])
  expect(unregister).toHaveBeenCalledTimes(1)
})

test('waits for the server to take a child page link out of a toggle before deleting the toggle', async () => {
  const editor = makeEditor(toggle('Notes', p('keep'), link(7, 'Hiring plan', true)))
  provider.afterAck = () => removeFirst(editor, 'pageLinkBlock')
  const outcome = await moveBlocksToPage({
    session: sessionFor(editor, 'details', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  expect(outcome).toMatchObject({result: 'moved', meta: null})
  expect(nodeNames(editor)).not.toContain('details')
  expect(dispatchDelete).toHaveBeenCalledWith(editor, expect.anything(), null)
  expect(outcome.moved).toHaveLength(1)
  expect(unregister).toHaveBeenCalledTimes(1)
})

test('copies a child page move when the server never takes the link out', async () => {
  jest.useFakeTimers()
  const editor = makeEditor(toggle('Notes', p('keep'), link(7, 'Hiring plan', true)))
  const pending = moveBlocksToPage({
    session: sessionFor(editor, 'details', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  await jest.advanceTimersByTimeAsync(10_000)
  expect((await pending).result).toBe('copied')
  expect(nodeNames(editor)).toContain('details')
  expect(unregister).toHaveBeenCalledTimes(1)
})

test('keeps the copy of a child page move whose save is acked late', async () => {
  jest.useFakeTimers()
  provider.stuck = true
  const editor = makeEditor(toggle('Notes', p('keep'), link(7, 'Hiring plan', true)))
  const pending = moveBlocksToPage({
    session: sessionFor(editor, 'details', 0),
    targetPageId: 'page:2',
    targetTitle: 'Q3'
  })
  await jest.advanceTimersByTimeAsync(10_000)
  const outcome = await pending
  expect(outcome).toMatchObject({result: 'copied', meta: null, gap: null})
  expect(outcome.moved).toHaveLength(1)
  expect(read(targetFrag).map(({type}) => type)).toEqual(['heading', 'details'])
  expect(nodeNames(editor)).toContain('details')
  expect(unregister).toHaveBeenCalledTimes(1)
})

test('moves a block from a shared page while a collaborator types in another block', async () => {
  const sourceFrag = seed(h(1, 'Title'), p('moved me'), p('stays'))
  const collabEditor = new Editor({
    element: document.createElement('div'),
    extensions: [
      ...extensions.map((extension) =>
        extension.name === 'starterKit' ? extension.configure({undoRedo: false}) : extension
      ),
      Collaboration.configure({document: sourceFrag.doc!})
    ]
  })
  provider.beforeAck = () => {
    sourceFrag.doc!.transact(() => {
      ;((sourceFrag.get(2) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'still ')
    }, 'collaborator')
  }
  try {
    const outcome = await moveBlocksToPage({
      session: sessionFor(collabEditor, 'paragraph', 0),
      targetPageId: 'page:2',
      targetTitle: 'Q3'
    })
    expect(outcome.result).toBe('moved')
    expect(paragraphTexts(collabEditor)).toEqual(['still stays'])
    expect(read(targetFrag)).toEqual([h(1, 'Q3'), p('moved me')])
  } finally {
    collabEditor.destroy()
  }
})
