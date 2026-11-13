import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor, type JSONContent} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../extensions/__tests__/installHappyDom'
import {trackRange} from '../trackRange'
import {waitForChildLinksRemoved} from '../waitForChildLinksRemoved'
import {waitForSaved} from '../waitForSaved'
import {destroyEditors, h, li, link, makeEditor, p, rangeOf, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const fakeProvider = ({unsynced}: {unsynced: boolean}) => {
  let hasUnsyncedChanges = unsynced
  const listeners = new Set<(payload: {number: number}) => void>()
  return {
    get hasUnsyncedChanges() {
      return hasUnsyncedChanges
    },
    on: (_event: string, listener: (payload: {number: number}) => void) => {
      listeners.add(listener)
    },
    off: (_event: string, listener: (payload: {number: number}) => void) => {
      listeners.delete(listener)
    },
    ack: () => {
      hasUnsyncedChanges = false
      listeners.forEach((listener) => {
        listener({number: 0})
      })
    }
  } as unknown as Pick<HocuspocusProvider, 'hasUnsyncedChanges' | 'on' | 'off'> & {ack(): void}
}

afterEach(() => {
  jest.useRealTimers()
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('waitForSaved resolves when the last change is acknowledged', async () => {
  const provider = fakeProvider({unsynced: true})
  const saved = waitForSaved(provider, 10_000)
  provider.ack()
  await expect(saved).resolves.toBe(true)
})

test('waitForSaved resolves at once when nothing is unsaved', async () => {
  await expect(waitForSaved(fakeProvider({unsynced: false}), 10_000)).resolves.toBe(true)
})

test('waitForSaved gives up after the timeout', async () => {
  jest.useFakeTimers()
  const saved = waitForSaved(fakeProvider({unsynced: true}), 10_000)
  jest.advanceTimersByTime(10_000)
  await expect(saved).resolves.toBe(false)
})

test('trackRange follows edits before the range and goes null when the range is deleted', () => {
  const editor = makeEditor(p('a'), p('b'))
  const {from, to} = rangeOf(editor, 'paragraph', 1)
  const range = trackRange(editor, from, to)
  editor.commands.insertContentAt(rangeOf(editor, 'paragraph', 0).from, p('new'))
  expect(range.current()).toEqual({from: from + 5, to: to + 5})
  const now = range.current()!
  editor.view.dispatch(editor.state.tr.delete(now.from, now.to))
  expect(range.current()).toBeNull()
})

test('trackRange keeps inserts at its edges outside and stops tracking on stop', () => {
  const editor = makeEditor(p('a'))
  const {from, to} = rangeOf(editor, 'paragraph', 0)
  const range = trackRange(editor, from, to)
  editor.view.dispatch(editor.state.tr.insert(to, editor.schema.nodeFromJSON(p('after'))))
  expect(range.current()).toEqual({from, to})
  range.stop()
  editor.view.dispatch(editor.state.tr.insert(from, editor.schema.nodeFromJSON(p('before'))))
  expect(range.current()).toEqual({from, to})
})

test('a gap survives typing at it', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const gap = rangeOf(editor, 'paragraph', 2).from
  const range = trackRange(editor, gap, gap)
  editor.commands.insertContentAt(gap, 'typed')
  expect(range.current()).toEqual({from: gap, to: gap})
  editor.view.dispatch(editor.state.tr.insert(gap, editor.schema.nodeFromJSON(p('block'))))
  expect(range.current()).toEqual({from: gap, to: gap})
  const before = rangeOf(editor, 'paragraph', 1)
  editor.view.dispatch(editor.state.tr.delete(before.from, before.to))
  expect(range.current()).toEqual({from: before.from, to: before.from})
  const {from} = rangeOf(editor, 'paragraph', 0)
  const {to} = rangeOf(editor, 'paragraph', 1)
  editor.view.dispatch(editor.state.tr.delete(from, to))
  expect(range.current()).toBeNull()
})

test('waitForChildLinksRemoved resolves at once when no link remains', async () => {
  const editor = makeEditor(p('a'))
  await expect(waitForChildLinksRemoved(editor, [7], 10_000)).resolves.toBe(true)
})

test('waitForChildLinksRemoved resolves once the server removes the link', async () => {
  const editor = makeEditor(toggle('Notes', link(7, 'Hiring plan', true)))
  const done = waitForChildLinksRemoved(editor, [7], 10_000)
  const {from, to} = rangeOf(editor, 'pageLinkBlock', 0)
  editor.view.dispatch(editor.state.tr.delete(from, to))
  await expect(done).resolves.toBe(true)
})

test('waitForChildLinksRemoved gives up after the timeout', async () => {
  jest.useFakeTimers()
  const editor = makeEditor(toggle('Notes', link(7, 'Hiring plan', true)))
  const done = waitForChildLinksRemoved(editor, [7], 10_000)
  jest.advanceTimersByTime(10_000)
  await expect(done).resolves.toBe(false)
})

const makeCollabEditor = (ydoc: Y.Doc, ...blocks: JSONContent[]) => {
  const collabEditor = new Editor({
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
      Collaboration.configure({document: ydoc})
    ]
  })
  collabEditor.commands.setContent({type: 'doc', content: [h(1, 'Title'), ...blocks]})
  return collabEditor
}

const collaborate = (...blocks: JSONContent[]) => {
  const ydoc = new Y.Doc()
  const collabEditor = makeCollabEditor(ydoc, ...blocks)
  const peer = new Y.Doc()
  Y.applyUpdate(peer, Y.encodeStateAsUpdate(ydoc))
  const sync = (from: Y.Doc, to: Y.Doc) => Y.applyUpdate(to, Y.encodeStateAsUpdate(from))
  return {collabEditor, peerFrag: peer.getXmlFragment('default'), peer, ydoc, sync}
}

const textAt = (activeEditor: Editor, range: {from: number; to: number} | null) =>
  range ? activeEditor.state.doc.textBetween(range.from, range.to) : null

test('a range survives a collaborator edit', () => {
  const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'))
  const {from, to} = rangeOf(collabEditor, 'paragraph', 1)
  const range = trackRange(collabEditor, from, to)
  peer.transact(() => {
    peerFrag.insert(1, [new Y.XmlElement('paragraph')])
  })
  sync(peer, ydoc)
  const now = range.current()
  expect(now).toEqual({from: from + 2, to: to + 2})
  expect(textAt(collabEditor, now)).toBe('b')
  collabEditor.destroy()
})

test('a range goes null when a collaborator deletes its block', () => {
  const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'))
  const {from, to} = rangeOf(collabEditor, 'paragraph', 1)
  const range = trackRange(collabEditor, from, to)
  peer.transact(() => {
    peerFrag.delete(2, 1)
  })
  sync(peer, ydoc)
  expect(range.current()).toBeNull()
  collabEditor.destroy()
})

test('a gap survives a collaborator edit at it', () => {
  const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'))
  const {to} = rangeOf(collabEditor, 'paragraph', 0)
  const gap = trackRange(collabEditor, to, to)
  peer.transact(() => {
    peerFrag.insert(2, [new Y.XmlElement('paragraph')])
  })
  sync(peer, ydoc)
  expect(gap.current()).toEqual({from: to, to})
  collabEditor.destroy()
})

const expectBlockBoundary = (activeEditor: Editor, pos: number, depth: number) => {
  const $pos = activeEditor.state.doc.resolve(pos)
  expect($pos.depth).toBe(depth)
  expect($pos.parent.inlineContent).toBe(false)
}

const typeAtEndOfBlock = (activeEditor: Editor, blockIndex: number, text: string) => {
  const block = activeEditor.state.doc.child(blockIndex)
  let pos = 0
  for (let i = 0; i < blockIndex; i++) pos += activeEditor.state.doc.child(i).nodeSize
  activeEditor.commands.insertContentAt(pos + block.nodeSize - 1, text)
}

const typeRemotelyAtEndOfBlock = (peerFrag: Y.XmlFragment, blockIndex: number, text: string) => {
  const yText = (peerFrag.get(blockIndex) as Y.XmlElement).get(0) as Y.XmlText
  yText.insert(yText.length, text)
}

describe('block-boundary anchors', () => {
  const boundaryBeforeSecondBlock = (activeEditor: Editor) =>
    rangeOf(activeEditor, 'paragraph', 1).from

  test('a gap stays between blocks when text is typed locally at the end of the block before it', () => {
    const {collabEditor} = collaborate(p('a'), p('b'), p('c'))
    const at = boundaryBeforeSecondBlock(collabEditor)
    const gap = trackRange(collabEditor, at, at)
    typeAtEndOfBlock(collabEditor, 1, 'XYZ')
    const now = gap.current()!
    expectBlockBoundary(collabEditor, now.from, 0)
    expect(collabEditor.state.doc.resolve(now.from).nodeBefore?.textContent).toBe('aXYZ')
    expect(collabEditor.state.doc.resolve(now.from).nodeAfter?.textContent).toBe('b')
    collabEditor.destroy()
  })

  test('a gap stays between blocks when a collaborator types at the end of the block before it', () => {
    const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'), p('c'))
    const at = boundaryBeforeSecondBlock(collabEditor)
    const gap = trackRange(collabEditor, at, at)
    typeRemotelyAtEndOfBlock(peerFrag, 1, 'XYZ')
    sync(peer, ydoc)
    const now = gap.current()!
    expectBlockBoundary(collabEditor, now.from, 0)
    expect(collabEditor.state.doc.resolve(now.from).nodeBefore?.textContent).toBe('aXYZ')
    collabEditor.destroy()
  })

  test('a gap after the title stays after the title when its end is typed at', () => {
    const {collabEditor} = collaborate(p('a'))
    const at = collabEditor.state.doc.child(0).nodeSize
    const gap = trackRange(collabEditor, at, at)
    typeAtEndOfBlock(collabEditor, 0, ' plan')
    const now = gap.current()!
    expectBlockBoundary(collabEditor, now.from, 0)
    expect(collabEditor.state.doc.resolve(now.from).nodeBefore?.textContent).toBe('Title plan')
    collabEditor.destroy()
  })

  test('a range keeps covering exactly its block when the end of that block is typed at', () => {
    const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'))
    const {from, to} = rangeOf(collabEditor, 'paragraph', 1)
    const range = trackRange(collabEditor, from, to)
    typeAtEndOfBlock(collabEditor, 2, 'XYZ')
    sync(ydoc, peer)
    typeRemotelyAtEndOfBlock(peerFrag, 2, '!')
    sync(peer, ydoc)
    const now = range.current()!
    expectBlockBoundary(collabEditor, now.from, 0)
    expectBlockBoundary(collabEditor, now.to, 0)
    const node = collabEditor.state.doc.nodeAt(now.from)!
    expect(node.textContent).toBe('bXYZ!')
    expect(now.to - now.from).toBe(node.nodeSize)
    collabEditor.destroy()
  })

  test('a range goes null when its block is deleted locally with the undo plugin on', () => {
    const {collabEditor} = collaborate(p('a'), p('b'))
    const {from, to} = rangeOf(collabEditor, 'paragraph', 1)
    const range = trackRange(collabEditor, from, to)
    collabEditor.view.dispatch(collabEditor.state.tr.delete(from, to))
    expect(range.current()).toBeNull()
    collabEditor.destroy()
  })

  test('a gap still resolves between blocks when a collaborator deletes the block before it', () => {
    const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), p('b'), p('c'))
    const at = rangeOf(collabEditor, 'paragraph', 2).from
    const gap = trackRange(collabEditor, at, at)
    peer.transact(() => {
      peerFrag.delete(2, 1)
    })
    sync(peer, ydoc)
    const now = gap.current()!
    expectBlockBoundary(collabEditor, now.from, 0)
    expect(collabEditor.state.doc.resolve(now.from).nodeAfter?.textContent).toBe('c')
    collabEditor.destroy()
  })

  test('a nested range shifts with edits before it and keeps its depth', () => {
    const list: JSONContent = {
      type: 'bulletList',
      content: [li('x'), li('y')]
    }
    const {collabEditor, peerFrag, peer, ydoc, sync} = collaborate(p('a'), list)
    const {from, to} = rangeOf(collabEditor, 'listItem', 1)
    const range = trackRange(collabEditor, from, to)
    const peerList = peerFrag.get(2) as Y.XmlElement
    peer.transact(() => {
      peerList.insert(0, [(peerList.get(0) as Y.XmlElement).clone()])
      peerFrag.insert(1, [new Y.XmlElement('paragraph')])
    })
    sync(peer, ydoc)
    const now = range.current()!
    expectBlockBoundary(collabEditor, now.from, 1)
    expectBlockBoundary(collabEditor, now.to, 1)
    const node = collabEditor.state.doc.nodeAt(now.from)!
    expect(node.type.name).toBe('listItem')
    expect(node.textContent).toBe('y')
    expect(now.to - now.from).toBe(node.nodeSize)
    collabEditor.destroy()
  })
})
