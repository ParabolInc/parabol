import './installHappyDom'
import {Editor} from '@tiptap/core'
import {extensions, h, p} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {BlockArrival, clearBlockArrival, showBlockArrival} from '../BlockArrival'

const makeEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [...extensions, BlockArrival],
    content: {type: 'doc', content: [h(1, 'Title'), p('stays'), p('arrived one'), p('arrived two')]}
  })

const positionOf = (editor: Editor, text: string) => {
  let found = -1
  editor.state.doc.forEach((node, offset) => {
    if (node.textContent === text) found = offset
  })
  return found
}

const highlighted = (editor: Editor) =>
  [...editor.view.dom.querySelectorAll('.block-arrived')].map((el) => el.textContent)

test('highlights the arrived blocks without changing the document', () => {
  const editor = makeEditor()
  const before = editor.state.doc
  showBlockArrival(editor.view, [
    positionOf(editor, 'arrived one'),
    positionOf(editor, 'arrived two')
  ])
  expect(highlighted(editor)).toEqual(['arrived one', 'arrived two'])
  expect(editor.state.doc).toBe(before)
  editor.destroy()
})

test('keeps the highlight on the same blocks when content is inserted above them', () => {
  const editor = makeEditor()
  showBlockArrival(editor.view, [positionOf(editor, 'arrived one')])
  editor.commands.insertContentAt(positionOf(editor, 'stays'), p('inserted above'))
  expect(highlighted(editor)).toEqual(['arrived one'])
  editor.destroy()
})

test('clearing removes the highlight', () => {
  const editor = makeEditor()
  showBlockArrival(editor.view, [positionOf(editor, 'arrived one')])
  clearBlockArrival(editor.view)
  expect(highlighted(editor)).toEqual([])
  editor.destroy()
})

test('skips positions that no longer hold a block', () => {
  const editor = makeEditor()
  showBlockArrival(editor.view, [editor.state.doc.content.size + 5])
  expect(highlighted(editor)).toEqual([])
  editor.destroy()
})
