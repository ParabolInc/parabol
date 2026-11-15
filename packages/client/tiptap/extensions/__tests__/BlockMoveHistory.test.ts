import './installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor, type JSONContent} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import {yUndoPluginKey} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import type Atmosphere from '../../../Atmosphere'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {
  h,
  li,
  normalize,
  p,
  rangeOf,
  read,
  schema,
  seed
} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {appendBlocksToFragment} from '../../blockMove/appendBlocksToFragment'
import {type BlockMoveMeta, dispatchBlockMoveDelete} from '../../blockMove/blockMoveUndoStack'
import {getMovableBlocks} from '../../blockMove/getMovableBlocks'
import {trackRange} from '../../blockMove/trackRange'
import {undoBlockMove} from '../../blockMove/undoBlockMove'
import {waitForSaved} from '../../blockMove/waitForSaved'
import {providerManager} from '../../providerManager'
import {BlockMoveHistory} from '../BlockMoveHistory'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

let mockTargetDoc: Y.Doc
const mockProvider = (authorizedScope: string) => ({
  document: mockTargetDoc,
  authorizedScope,
  hasUnsyncedChanges: false,
  on() {},
  off() {}
})
jest.mock('../../blockMove/waitForSaved', () => {
  const actual = jest.requireActual('../../blockMove/waitForSaved')
  return {...actual, waitForSaved: jest.fn(actual.waitForSaved)}
})
jest.mock('../../providerManager', () => ({
  providerManager: {
    openSynced: jest.fn(() => Promise.resolve(mockProvider('read-write'))),
    unregister: jest.fn()
  }
}))

const openSynced = jest.mocked(providerManager.openSynced)
const savedInTime = jest.mocked(waitForSaved)
const unreachableTargets = [
  ['offline', null],
  ['read-only', 'readonly']
] as const
const openTarget = (scope: string | null) =>
  scope ? (mockProvider(scope) as unknown as HocuspocusProvider) : null

const atmosphere = {eventEmitter: {emit: jest.fn()}} as unknown as Atmosphere
let editor: Editor
let targetFrag: Y.XmlFragment
let sourceFrag: Y.XmlFragment

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

const paragraphTexts = (activeEditor: Editor) => {
  const texts: string[] = []
  activeEditor.state.doc.descendants((node) => {
    if (node.type.name === 'paragraph') texts.push(node.textContent)
  })
  return texts
}

const endOfDoc = (activeEditor: Editor) => activeEditor.state.doc.content.size

const moveFirstParagraph = (activeEditor: Editor, frag: Y.XmlFragment) => {
  const {from, to} = rangeOf(activeEditor, 'paragraph', 0)
  const blocks = getMovableBlocks(activeEditor.state.doc, from, to).blocks
  const moved = appendBlocksToFragment(frag, blocks, activeEditor.schema)
  const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
  dispatchBlockMoveDelete(activeEditor, activeEditor.state.tr.deleteRange(from, to), meta)
  return meta
}

const isMac = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
const pressMod = (activeEditor: Editor, key: string, shiftKey = false) => {
  activeEditor.view.dom.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      shiftKey,
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
      cancelable: true
    })
  )
}

const slowTarget = () => {
  let finishOpening: (provider: HocuspocusProvider | null) => void = () => {}
  openSynced.mockReturnValueOnce(
    new Promise((resolve) => {
      finishOpening = resolve
    })
  )
  return (scope: string | null) => finishOpening(openTarget(scope))
}

const editTargetBlock = (index: number) => {
  ;((targetFrag.get(index) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'edited ')
}

beforeEach(() => {
  ;(atmosphere.eventEmitter.emit as jest.Mock).mockClear()
  targetFrag = seed(h(1, 'Q3'))
  mockTargetDoc = targetFrag.doc!
  sourceFrag = seed(h(1, 'Title'), p('moved me'), p('stays'))
  editor = makeCollabEditor(sourceFrag.doc!)
})

afterEach(() => {
  if (!editor.isDestroyed) editor.destroy()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('undo restores the source and removes the block from the target', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toContain('moved me')
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('undo leaves a block someone edited on the target and says so', async () => {
  moveFirstParagraph(editor, targetFrag)
  editTargetBlock(1)
  editor.commands.undo()
  await flushPromises()
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'blockMoveUndo',
      autoDismiss: 10,
      message: 'That block was edited on Q3 Roadmap, so it stayed there.'
    })
  )
})

test('undo of a partly edited move says how many came back', async () => {
  const {from} = rangeOf(editor, 'paragraph', 0)
  const {to} = rangeOf(editor, 'paragraph', 1)
  const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
  const moved = appendBlocksToFragment(targetFrag, blocks, schema)
  const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
  editTargetBlock(2)
  editor.commands.undo()
  await flushPromises()
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      message: 'Moved back 1 of 2 blocks. One was edited on Q3 Roadmap, so it stayed there.'
    })
  )
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('edited stays')]))
})

test('a clean undo shows no snackbar', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  expect(atmosphere.eventEmitter.emit).not.toHaveBeenCalled()
})

test('redo moves the block again', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  editor.commands.redo()
  await flushPromises()
  expect(paragraphTexts(editor)).not.toContain('moved me')
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
})

test('undo after redo takes the new copy back', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  editor.commands.redo()
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toContain('moved me')
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('the move is its own undo step', async () => {
  editor.commands.insertContentAt(endOfDoc(editor), p('typed just now'))
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(expect.arrayContaining(['moved me', 'typed just now']))
})

test('a move without meta is not undoable', async () => {
  editor.commands.insertContentAt(endOfDoc(editor), p('typed first'))
  const undoManager = yUndoPluginKey.getState(editor.state)!.undoManager
  undoManager.stopCapturing()
  const before = undoManager.undoStack.length
  const {from, to} = rangeOf(editor, 'paragraph', 0)
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), null)
  expect(undoManager.undoStack.length).toBe(before)
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['stays'])
})

test('a redo copies to the target before it deletes here', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  let targetWhenSourceDeleted: JSONContent[] | null = null
  sourceFrag.doc!.on('afterTransaction', () => {
    if (targetWhenSourceDeleted || JSON.stringify(read(sourceFrag)).includes('moved me')) return
    targetWhenSourceDeleted = read(targetFrag)
  })
  editor.commands.redo()
  await flushPromises()
  expect(targetWhenSourceDeleted).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  expect(paragraphTexts(editor)).toEqual(['stays'])
})

test('a redo that fails leaves the redo step and never touches this page', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  const undoManager = yUndoPluginKey.getState(editor.state)!.undoManager
  const redoItem = undoManager.redoStack.at(-1)
  let sourceChanges = 0
  sourceFrag.observeDeep(() => {
    sourceChanges++
  })
  savedInTime.mockResolvedValueOnce(false)
  editor.commands.redo()
  await flushPromises()
  expect(sourceChanges).toBe(0)
  expect(undoManager.redoStack.at(-1)).toBe(redoItem)
  expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
})

test('a ⌘⇧Z pressed again while a redo is on its way does not move the block twice', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  const finishOpening = slowTarget()
  editor.commands.redo()
  editor.commands.redo()
  finishOpening('read-write')
  await flushPromises()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
})

describe('a redo slowed down while the user keeps working', () => {
  const moveListItem = () => {
    editor.destroy()
    sourceFrag = seed(
      h(1, 'Title'),
      {type: 'bulletList', content: [li('moved me'), li('other')]},
      p('stays')
    )
    editor = makeCollabEditor(sourceFrag.doc!)
    const {from, to} = rangeOf(editor, 'listItem', 0)
    const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
    const moved = appendBlocksToFragment(targetFrag, blocks, editor.schema)
    const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
    dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
  }
  const collaboratorDeletesTheList = () => {
    sourceFrag.doc!.transact(() => {
      sourceFrag.delete(1, 1)
    }, 'collaborator')
  }

  test('never undoes what the user typed when the target fails', async () => {
    moveListItem()
    editor.commands.undo()
    await flushPromises()
    const finishOpening = slowTarget()
    editor.commands.redo()
    await flushPromises()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed'))
    expect(paragraphTexts(editor)).toContain('moved me')
    collaboratorDeletesTheList()
    finishOpening(null)
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays', 'typed'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
    expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
      'addSnackbar',
      expect.objectContaining({message: 'Couldn’t move: you’re offline. Nothing changed.'})
    )
  })

  test('keeps what the user typed and lands the block on the target when it succeeds', async () => {
    moveListItem()
    editor.commands.undo()
    await flushPromises()
    const finishOpening = slowTarget()
    editor.commands.redo()
    await flushPromises()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed'))
    collaboratorDeletesTheList()
    finishOpening('read-write')
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays', 'typed'])
    expect(JSON.stringify(read(targetFrag))).toContain('moved me')
  })

  test('finishes the move even though the user typed meanwhile', async () => {
    moveListItem()
    editor.commands.undo()
    await flushPromises()
    const finishOpening = slowTarget()
    editor.commands.redo()
    await flushPromises()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed'))
    finishOpening('read-write')
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['other', 'stays', 'typed'])
    expect(JSON.stringify(read(targetFrag))).toContain('moved me')
  })
})

test('a redo keeps the original here when someone edited it meanwhile', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  const finishOpening = slowTarget()
  editor.commands.redo()
  await flushPromises()
  sourceFrag.doc!.transact(() => {
    ;((sourceFrag.get(1) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'edited ')
  }, 'collaborator')
  finishOpening('read-write')
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['edited moved me', 'stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'blockMove',
      message: 'Copied 1 block to Q3 Roadmap. Someone was editing it, so the original stayed here.'
    })
  )
})

test('an undo that cannot put the block back leaves the copy on the target and nothing else', async () => {
  editor.destroy()
  sourceFrag = seed(
    h(1, 'Title'),
    {type: 'bulletList', content: [li('moved me'), li('other')]},
    p('stays')
  )
  editor = makeCollabEditor(sourceFrag.doc!)
  editor.commands.insertContentAt(endOfDoc(editor), p('typed'))
  const undoManager = yUndoPluginKey.getState(editor.state)!.undoManager
  undoManager.stopCapturing()
  const {from, to} = rangeOf(editor, 'listItem', 0)
  const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
  const moved = appendBlocksToFragment(targetFrag, blocks, editor.schema)
  const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
  dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
  sourceFrag.doc!.transact(() => {
    sourceFrag.delete(1, 1)
  }, 'collaborator')
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['stays', 'typed'])
  expect(JSON.stringify(read(targetFrag))).toContain('moved me')
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'blockMoveUndo',
      message: 'Couldn’t move it back here, so it stayed on Q3 Roadmap.'
    })
  )
})

describe('the keyboard', () => {
  test('⌘Z right after a move restores here and removes from the target', async () => {
    moveFirstParagraph(editor, targetFrag)
    pressMod(editor, 'z')
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
    pressMod(editor, 'z', true)
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  })

  test('⌘Z and ⌘⇧Z on an ordinary edit work as before, with a move further back', async () => {
    moveFirstParagraph(editor, targetFrag)
    editor.commands.insertContentAt(endOfDoc(editor), p('typed'))
    pressMod(editor, 'z')
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
    pressMod(editor, 'z', true)
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays', 'typed'])
    pressMod(editor, 'z')
    pressMod(editor, 'y')
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['stays', 'typed'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  })
})

test.each(unreachableTargets)(
  'a redo whose target is %s puts the block back and says so',
  async (_name, scope) => {
    moveFirstParagraph(editor, targetFrag)
    editor.commands.undo()
    await flushPromises()
    openSynced.mockResolvedValueOnce(openTarget(scope))
    editor.commands.redo()
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
    expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
      'addSnackbar',
      expect.objectContaining({
        key: 'blockMove',
        autoDismiss: 10,
        message: scope
          ? 'Couldn’t move: you can only view Q3 Roadmap. Nothing changed.'
          : 'Couldn’t move: you’re offline. Nothing changed.'
      })
    )
  }
)

test.each(unreachableTargets)(
  'an undo whose target is %s keeps the block here and says so',
  async (_name, scope) => {
    moveFirstParagraph(editor, targetFrag)
    openSynced.mockResolvedValueOnce(openTarget(scope))
    editor.commands.undo()
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
    expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
      'addSnackbar',
      expect.objectContaining({
        key: 'blockMoveUndo',
        autoDismiss: 10,
        message: 'Moved back here. Q3 Roadmap couldn’t be reached, so the copy there stayed.'
      })
    )
  }
)

test('a redo whose copy never saves puts the block back and cleans the target', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  savedInTime.mockResolvedValueOnce(false)
  editor.commands.redo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'blockMove',
      autoDismiss: 10,
      message: 'Couldn’t move: Q3 Roadmap didn’t save in time. Nothing changed.'
    })
  )
  editor.commands.redo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
})

test('an undo whose removal never saves says the copy stayed', async () => {
  moveFirstParagraph(editor, targetFrag)
  savedInTime.mockResolvedValueOnce(false)
  editor.commands.undo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  expect(atmosphere.eventEmitter.emit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({
      key: 'blockMoveUndo',
      autoDismiss: 10,
      message: 'Moved back here. Q3 Roadmap couldn’t be reached, so the copy there stayed.'
    })
  )
})

test('⌘Z during a slow offline redo, then ⌘⇧Z online, ends with the block on the target', async () => {
  moveFirstParagraph(editor, targetFrag)
  editor.commands.undo()
  await flushPromises()
  let finishOpening: (provider: HocuspocusProvider | null) => void = () => {}
  openSynced.mockReturnValueOnce(
    new Promise((resolve) => {
      finishOpening = resolve
    })
  )
  editor.commands.redo()
  await flushPromises()
  editor.commands.undo()
  finishOpening(null)
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  editor.commands.redo()
  await flushPromises()
  expect(paragraphTexts(editor)).toEqual(['stays'])
  expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
})

describe('the snackbar Undo', () => {
  const moveWithGap = () => {
    const {from} = rangeOf(editor, 'paragraph', 0)
    const meta: BlockMoveMeta = moveFirstParagraph(editor, targetFrag)
    return {meta, gap: trackRange(editor, from, from)}
  }

  test('undoes the move when it is the latest step', async () => {
    const {meta, gap} = moveWithGap()
    await undoBlockMove(editor, meta, gap)
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
    expect(yUndoPluginKey.getState(editor.state)!.undoManager.redoStack.length).toBe(1)
  })

  test('puts the block back in its gap after later edits', async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed later'))
    await undoBlockMove(editor, meta, gap)
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays', 'typed later'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  })

  test('changes nothing once the move was undone with ⌘Z', async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.undo()
    await flushPromises()
    await undoBlockMove(editor, meta, gap)
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  })

  test("a later ⌘Z after the snackbar fallback doesn't restore the block twice", async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed later'))
    await undoBlockMove(editor, meta, gap)
    editor.commands.undo()
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
    editor.commands.undo()
    await flushPromises()
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  })

  test('restores the block as its own paragraph after the title was typed at', async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.insertContentAt(editor.state.doc.child(0).nodeSize - 1, ' plan')
    await undoBlockMove(editor, meta, gap)
    expect(editor.state.doc.child(0).textContent).toBe('Title plan')
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays'])
  })

  test('restores the block as its own paragraph after the paragraph before it was typed at', async () => {
    const {from, to} = rangeOf(editor, 'paragraph', 1)
    const blocks = getMovableBlocks(editor.state.doc, from, to).blocks
    const moved = appendBlocksToFragment(targetFrag, blocks, editor.schema)
    const meta = {targetPageId: 'page:2', targetTitle: 'Q3 Roadmap', moved, blocks}
    const gap = trackRange(editor, from, from)
    dispatchBlockMoveDelete(editor, editor.state.tr.deleteRange(from, to), meta)
    editor.commands.insertContentAt(from - 1, ' typed')
    await undoBlockMove(editor, meta, gap)
    expect(paragraphTexts(editor)).toEqual(['moved me typed', 'stays'])
  })

  test('does nothing once the editor is gone', async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed later'))
    const sourceBefore = read(sourceFrag)
    editor.destroy()
    await undoBlockMove(editor, meta, gap)
    expect(read(sourceFrag)).toEqual(sourceBefore)
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3'), p('moved me')]))
  })

  test('after a redo, removes the copy the redo made', async () => {
    const {meta, gap} = moveWithGap()
    editor.commands.undo()
    await flushPromises()
    editor.commands.redo()
    await flushPromises()
    editor.commands.insertContentAt(endOfDoc(editor), p('typed later'))
    await undoBlockMove(editor, meta, gap)
    expect(paragraphTexts(editor)).toEqual(['moved me', 'stays', 'typed later'])
    expect(read(targetFrag)).toEqual(normalize([h(1, 'Q3')]))
  })
})
