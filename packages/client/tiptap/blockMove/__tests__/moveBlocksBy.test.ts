import '../../extensions/__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {isNodeRangeSelection} from '@tiptap/extension-node-range'
import {NodeSelection} from '@tiptap/pm/state'
import type Atmosphere from '../../../Atmosphere'
import {callout, posInText, textsIn} from '../../blockSelection/__tests__/blockSelectionTestHelpers'
import {getSelectedBlockRange, selectBlockRange} from '../../blockSelection/blockSelectionState'
import {normalizeBlockRange} from '../../blockSelection/blockUnits'
import {BlockMoveKeys} from '../../extensions/BlockMoveKeys'
import {moveBlocksBy} from '../moveBlocksBy'
import {destroyEditors, extensions, h, li, p, toggle} from './blockMoveTestHelpers'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../openMoveToPageMenu', () => ({openMoveToPageMenu: jest.fn()}))

const openEditors: Editor[] = []
const makeEditor = (...blocks: JSONContent[]) => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: [
      ...extensions,
      BlockMoveKeys.configure({atmosphere: {} as Atmosphere, pageId: 'page:1'})
    ],
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  openEditors.push(editor)
  return editor
}
afterEach(() => {
  openEditors.splice(0).forEach((editor) => {
    editor.destroy()
  })
  destroyEditors()
})

const bodyBlocks = (editor: Editor) => {
  const blocks: string[] = []
  editor.state.doc.forEach((node, _offset, index) => {
    if (index > 0) blocks.push(node.textContent)
  })
  return blocks
}
const listTexts = (editor: Editor) => {
  const texts: string[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'listItem') texts.push(node.textContent)
  })
  return texts
}
const selectedTexts = (editor: Editor) => {
  const range = getSelectedBlockRange(editor.state)
  if (!range) throw new Error('No block selection')
  return textsIn(editor, range)
}
const runOf = (editor: Editor, first: string, last: string) => {
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, first),
    posInText(editor, last)
  )
  if (!range) throw new Error('No run')
  return range
}

const isMac = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
const press = (editor: Editor, key: string) => {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey: true,
    metaKey: isMac,
    ctrlKey: !isMac,
    bubbles: true,
    cancelable: true
  })
  editor.view.dom.dispatchEvent(event)
  return event
}

test('moves the block at the caret below its next sibling and keeps the caret in it', () => {
  const editor = makeEditor(p('one'), p('two'), p('three'))
  editor.commands.setTextSelection(posInText(editor, 'one') + 1)
  expect(moveBlocksBy(editor, 'down')).toBe(true)
  expect(bodyBlocks(editor)).toEqual(['two', 'one', 'three'])
  expect(editor.state.selection.$from.parent.textContent).toBe('one')
})

test('a selected run moves together and stays selected', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'), p('d'))
  selectBlockRange(editor, runOf(editor, 'b', 'c'))
  moveBlocksBy(editor, 'up')
  expect(bodyBlocks(editor)).toEqual(['b', 'c', 'a', 'd'])
  expect(selectedTexts(editor)).toEqual(['b', 'c'])
})

test('a selected run keeps moving down together', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'), p('d'))
  selectBlockRange(editor, runOf(editor, 'a', 'b'))
  moveBlocksBy(editor, 'down')
  expect(bodyBlocks(editor)).toEqual(['c', 'a', 'b', 'd'])
  expect(selectedTexts(editor)).toEqual(['a', 'b'])
  expect(isNodeRangeSelection(editor.state.selection)).toBe(true)
})

test('the first block never moves above the title', () => {
  const editor = makeEditor(p('first'), p('second'))
  editor.commands.setTextSelection(posInText(editor, 'first'))
  const before = editor.state.doc
  expect(moveBlocksBy(editor, 'up')).toBe(true)
  expect(editor.state.doc.eq(before)).toBe(true)
})

test('list items move within their list and stop at its edge', () => {
  const editor = makeEditor({type: 'bulletList', content: [li('x'), li('y')]}, p('after'))
  editor.commands.setTextSelection(posInText(editor, 'y'))
  moveBlocksBy(editor, 'up')
  expect(listTexts(editor)).toEqual(['y', 'x'])
  const before = editor.state.doc
  expect(moveBlocksBy(editor, 'up')).toBe(true)
  expect(editor.state.doc.eq(before)).toBe(true)
})

test('a callout body block never swaps with the callout title', () => {
  const editor = makeEditor(callout('Heads up', p('body')))
  editor.commands.setTextSelection(posInText(editor, 'body'))
  const before = editor.state.doc
  expect(moveBlocksBy(editor, 'up')).toBe(true)
  expect(editor.state.doc.eq(before)).toBe(true)
})

test('the last block never moves below the trailing empty paragraph', () => {
  const editor = makeEditor(p('last'), {type: 'paragraph'})
  editor.commands.setTextSelection(posInText(editor, 'last'))
  const before = editor.state.doc
  expect(moveBlocksBy(editor, 'down')).toBe(true)
  expect(editor.state.doc.eq(before)).toBe(true)
})

test('the title itself is not a unit, so the key falls through', () => {
  const editor = makeEditor(p('body'))
  editor.commands.setTextSelection(2)
  expect(moveBlocksBy(editor, 'down')).toBe(false)
})

test('one move is one history step', () => {
  const editor = makeEditor(p('one'), p('two'), p('three'))
  editor.commands.setTextSelection(posInText(editor, 'one'))
  const before = editor.state.doc
  moveBlocksBy(editor, 'down')
  expect(editor.state.doc.eq(before)).toBe(false)
  editor.commands.undo()
  expect(editor.state.doc.eq(before)).toBe(true)
  expect(editor.state.selection.$from.parent.textContent).toBe('one')
})

test('Mod-Shift-ArrowDown runs it; a read-only editor ignores it', () => {
  const editor = makeEditor(p('one'), p('two'), p('three'))
  editor.commands.setTextSelection(posInText(editor, 'one'))
  press(editor, 'ArrowDown')
  expect(bodyBlocks(editor)).toEqual(['two', 'one', 'three'])
  editor.setEditable(false)
  const before = editor.state.doc
  press(editor, 'ArrowUp')
  expect(editor.state.doc.eq(before)).toBe(true)
})

test('a text selection from the title into the body leaves its title end in place', () => {
  const editor = makeEditor(p('a'), p('b'), p('c'))
  const anchor = 3
  editor.commands.setTextSelection({from: anchor, to: posInText(editor, 'a')})
  expect(moveBlocksBy(editor, 'down')).toBe(true)
  expect(bodyBlocks(editor)).toEqual(['b', 'a', 'c'])
  const {selection} = editor.state
  expect(selection.anchor).toBe(anchor)
  expect(selection.$anchor.parent.textContent).toBe('Title')
  expect(selection.head).toBe(posInText(editor, 'a'))
})

test('a text selection inside the run follows it in both directions', () => {
  const editor = makeEditor(p('one'), p('two'), p('three'))
  const from = posInText(editor, 'two') - 1
  editor.commands.setTextSelection({from, to: from + 2})
  moveBlocksBy(editor, 'down')
  expect(bodyBlocks(editor)).toEqual(['one', 'three', 'two'])
  expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).toBe(
    'tw'
  )
  moveBlocksBy(editor, 'up')
  moveBlocksBy(editor, 'up')
  expect(bodyBlocks(editor)).toEqual(['two', 'one', 'three'])
  expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).toBe(
    'tw'
  )
})

test('a selected leaf block moves and stays selected', () => {
  const editor = makeEditor(p('one'), {type: 'horizontalRule'}, p('two'))
  const ruleAt = () => {
    let pos = -1
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'horizontalRule') pos = offset
    })
    return pos
  }
  editor.view.dispatch(
    editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, ruleAt()))
  )
  moveBlocksBy(editor, 'down')
  expect(editor.state.doc.child(3).type.name).toBe('horizontalRule')
  const {selection} = editor.state
  expect(selection).toBeInstanceOf(NodeSelection)
  expect(selection.from).toBe(ruleAt())
  moveBlocksBy(editor, 'up')
  moveBlocksBy(editor, 'up')
  expect(editor.state.doc.child(1).type.name).toBe('horizontalRule')
  expect(editor.state.selection).toBeInstanceOf(NodeSelection)
  expect(editor.state.selection.from).toBe(ruleAt())
})

test('a list item moves within its list inside a toggle and a callout', () => {
  const list = () => ({type: 'bulletList', content: [li('x'), li('y')]})
  const editor = makeEditor(toggle('More', list()), callout('Heads up', list()))
  editor.commands.setTextSelection(posInText(editor, 'y'))
  moveBlocksBy(editor, 'up')
  expect(listTexts(editor)).toEqual(['y', 'x', 'x', 'y'])
  expect(editor.state.selection.$from.parent.textContent).toBe('y')
  const ys: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === 'y') ys.push(pos + 1)
  })
  editor.commands.setTextSelection(ys[1]!)
  moveBlocksBy(editor, 'up')
  expect(listTexts(editor)).toEqual(['y', 'x', 'y', 'x'])
  expect(editor.state.selection.$from.parent.textContent).toBe('y')
})

test('the trailing empty paragraph never moves above the last block', () => {
  const editor = makeEditor(p('last'), {type: 'paragraph'})
  editor.commands.setTextSelection(editor.state.doc.content.size - 1)
  expect(editor.state.selection.$from.parent.content.size).toBe(0)
  const before = editor.state.doc
  expect(moveBlocksBy(editor, 'up')).toBe(true)
  expect(editor.state.doc.eq(before)).toBe(true)
})
