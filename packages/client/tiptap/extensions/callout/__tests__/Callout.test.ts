import '../../__tests__/installHappyDom'
import {Editor, getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import type {Node} from '@tiptap/pm/model'
import {CalloutBase} from '../../../../shared/tiptap/extensions/CalloutBase'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {Callout} from '../Callout'

const pagesExtensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) => {
    if (extension.name === 'starterKit') {
      return extension.configure({document: false, trailingNode: {node: 'paragraph'}})
    }
    return extension === CalloutBase ? Callout : extension
  })
]
const schema = getSchema(pagesExtensions)

type Json = Record<string, unknown>
const text = (value: string, marks?: string[]): Json => ({
  type: 'text',
  text: value,
  ...(marks ? {marks: marks.map((type) => ({type}))} : {})
})
const p = (value = '') => ({type: 'paragraph', content: value ? [text(value)] : []})
const pBold = (value: string) => ({type: 'paragraph', content: [text(value, ['bold'])]})
const title = (value: string) => ({type: 'calloutTitle', content: value ? [text(value)] : []})
const callout = (tone: string, content: Json[]) => ({type: 'callout', attrs: {tone}, content})
const quote = (content: Json[]) => ({type: 'blockquote', content})
const TITLE = {type: 'heading', attrs: {level: 1}, content: [text('Title')]}

type CaretFinder = (doc: Node) => number

const findText = (doc: Node, match: (node: Node) => number | null) => {
  let found = -1
  doc.descendants((node, pos) => {
    if (found !== -1 || pos === 0) return false
    const offset = match(node)
    if (offset !== null) found = pos + offset
    return true
  })
  if (found === -1) throw new Error('No caret target')
  return found
}
const caretIn =
  (value: string): CaretFinder =>
  (doc) =>
    findText(doc, (node) =>
      node.isTextblock && node.textContent === value ? 1 + node.content.size : null
    )
const caretBefore =
  (value: string): CaretFinder =>
  (doc) =>
    findText(doc, (node) => {
      const index = node.isText ? (node.text ?? '').indexOf(value) : -1
      return index === -1 ? null : index
    })
const caretAfter =
  (value: string): CaretFinder =>
  (doc) =>
    caretBefore(value)(doc) + value.length

const mount = (blocks: Json[], caret?: CaretFinder) => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: pagesExtensions,
    content: {type: 'doc', content: [TITLE, ...blocks]}
  })
  if (caret) editor.commands.setTextSelection(caret(editor.state.doc))
  return editor
}

const press = (editor: Editor, key: string) => {
  const event = new KeyboardEvent('keydown', {key})
  return editor.view.someProp('handleKeyDown', (handler) => handler(editor.view, event))
}

const typeText = (editor: Editor, value: string) => {
  for (const character of value) {
    const {from, to} = editor.state.selection
    const view = editor.view
    const handled = view.someProp('handleTextInput', (handler) =>
      handler(view, from, to, character, () => view.state.tr.insertText(character))
    )
    if (!handled) view.dispatch(view.state.tr.insertText(character, from, to))
  }
}

const types = (editor: Editor) => editor.state.doc.children.map((node) => node.type.name)
const calloutPos = (editor: Editor) =>
  findText(editor.state.doc, (node) => (node.type.name === 'callout' ? 0 : null))
const calloutAt = (editor: Editor) => editor.state.doc.nodeAt(calloutPos(editor))!
const texts = (node: Node) => node.children.map((child) => child.textContent)
const normalize = (blocks: Json[]) => blocks.map((block) => schema.nodeFromJSON(block).toJSON())
const blocksAfterTitle = (editor: Editor) => editor.getJSON().content?.slice(1)
const TRAILING_LINE = p()

describe('Enter', () => {
  test('Enter on an empty last line leaves the callout', () => {
    const editor = mount([callout('info', [p('a'), p('')])], caretIn(''))
    press(editor, 'Enter')
    expect(types(editor)).toEqual(['heading', 'callout', 'paragraph'])
    expect(calloutAt(editor).childCount).toBe(1)
    expect(editor.state.selection.$from.parent.type.name).toBe('paragraph')
    expect(editor.state.selection.$from.depth).toBe(1)
  })

  test('leaving the callout adds a line above a following block', () => {
    const editor = mount([callout('info', [p('a'), p('')]), p('after')], caretIn(''))
    press(editor, 'Enter')
    expect(types(editor)).toEqual(['heading', 'callout', 'paragraph', 'paragraph'])
    expect(editor.state.doc.child(2).textContent).toBe('')
    expect(editor.state.selection.$from.index(0)).toBe(2)
  })

  test('Enter in an only, empty paragraph stays inside', () => {
    const editor = mount([callout('info', [p('')])], caretIn(''))
    press(editor, 'Enter')
    expect(calloutAt(editor).childCount).toBe(2)
  })

  test('Enter on an empty middle line adds a paragraph inside', () => {
    const editor = mount([callout('info', [p('a'), p(''), p('b')])], caretIn(''))
    press(editor, 'Enter')
    expect(types(editor)).toEqual(['heading', 'callout', 'paragraph'])
    expect(texts(calloutAt(editor))).toEqual(['a', '', '', 'b'])
  })

  test('Enter mid-title moves the rest into a new first paragraph', () => {
    const editor = mount(
      [callout('warning', [title('FreezeFriday'), p('x')])],
      caretAfter('Freeze')
    )
    press(editor, 'Enter')
    expect(texts(calloutAt(editor))).toEqual(['Freeze', 'Friday', 'x'])
    expect(calloutAt(editor).child(0).type.name).toBe('calloutTitle')
    expect(editor.state.selection.$from.parent.textContent).toBe('Friday')
  })

  test('Enter outside a callout is left to other handlers', () => {
    const editor = mount([p('ab')], caretAfter('a'))
    press(editor, 'Enter')
    expect(types(editor)).toEqual(['heading', 'paragraph', 'paragraph'])
  })
})

describe('Backspace', () => {
  test('Backspace at the very start unwraps and bolds the title', () => {
    const editor = mount([callout('danger', [title('Stop'), p('now')])], caretBefore('Stop'))
    press(editor, 'Backspace')
    expect(blocksAfterTitle(editor)).toEqual(normalize([pBold('Stop'), p('now'), TRAILING_LINE]))
    expect(editor.state.selection.from).toBe(caretBefore('Stop')(editor.state.doc))
  })

  test('Backspace at the start of the body unwraps when there is no title', () => {
    const editor = mount([callout('info', [p('one'), p('two')])], caretBefore('one'))
    press(editor, 'Backspace')
    expect(blocksAfterTitle(editor)).toEqual(normalize([p('one'), p('two'), TRAILING_LINE]))
    expect(editor.state.selection.from).toBe(caretBefore('one')(editor.state.doc))
  })

  test('an empty title is dropped when unwrapping', () => {
    const editor = mount([callout('info', [title(''), p('body')])], caretIn(''))
    press(editor, 'Backspace')
    expect(blocksAfterTitle(editor)).toEqual(normalize([p('body'), TRAILING_LINE]))
  })

  test('Backspace mid-text inside a callout is left to the browser', () => {
    const editor = mount([callout('info', [p('ab')])], caretAfter('a'))
    expect(press(editor, 'Backspace')).toBeFalsy()
    expect(texts(calloutAt(editor))).toEqual(['ab'])
  })

  test('Backspace at the start of a later body line is not an unwrap', () => {
    const editor = mount([callout('info', [p('one'), p('two')])], caretBefore('two'))
    press(editor, 'Backspace')
    expect(texts(calloutAt(editor))).toEqual(['onetwo'])
  })

  test('undo restores an unwrapped callout in one step', () => {
    const editor = mount([callout('danger', [p('now')])], caretBefore('now'))
    press(editor, 'Backspace')
    editor.commands.undo()
    expect(calloutAt(editor).attrs.tone).toBe('danger')
  })
})

describe('input rule', () => {
  test('typing [!WARNING] at the start of a quote makes a warning callout', () => {
    const editor = mount([quote([p('')])], caretIn(''))
    typeText(editor, '[!WARNING] ')
    expect(calloutAt(editor).attrs.tone).toBe('warning')
    expect(calloutAt(editor).textContent).toBe('')
  })

  test('typing > then [!NOTE] in an empty line makes an info callout', () => {
    const editor = mount([p('')], caretIn(''))
    typeText(editor, '> [!NOTE] ')
    expect(calloutAt(editor).attrs.tone).toBe('info')
    expect(calloutAt(editor).textContent).toBe('')
  })

  test('the quote keeps its other blocks', () => {
    const editor = mount([quote([p(''), p('rest')])], caretIn(''))
    typeText(editor, '[!tip] ')
    expect(types(editor)).toEqual(['heading', 'callout', 'paragraph'])
    expect(calloutAt(editor).attrs.tone).toBe('tip')
    expect(texts(calloutAt(editor))).toEqual(['', 'rest'])
  })

  test('an unknown type makes a plain callout', () => {
    const editor = mount([quote([p('')])], caretIn(''))
    typeText(editor, '[!Whatever] ')
    expect(calloutAt(editor).attrs.tone).toBe('plain')
  })

  test('the marker outside a quote stays text', () => {
    const editor = mount([p('')], caretIn(''))
    typeText(editor, '[!WARNING] ')
    expect(types(editor)).toEqual(['heading', 'paragraph'])
    expect(editor.state.doc.child(1).textContent).toBe('[!WARNING] ')
  })

  test('the marker in a later line of a quote stays text', () => {
    const editor = mount([quote([p('first'), p('')])], caretIn(''))
    typeText(editor, '[!WARNING] ')
    expect(editor.state.doc.child(1).type.name).toBe('blockquote')
    expect(editor.state.doc.child(1).child(1).textContent).toBe('[!WARNING] ')
  })
})

describe('commands', () => {
  test('setCallout wraps the current block and keeps the caret in it', () => {
    const editor = mount([p('hello')], caretAfter('hel'))
    editor.commands.setCallout({tone: 'tip'})
    expect(calloutAt(editor).attrs.tone).toBe('tip')
    expect(texts(calloutAt(editor))).toEqual(['hello'])
    expect(editor.state.selection.$from.node(1).type.name).toBe('callout')
    expect(editor.state.selection.$from.parentOffset).toBe(3)
  })

  test('setCalloutTone and setCalloutEmoji update the attributes', () => {
    const editor = mount([callout('info', [p('x')])])
    editor.commands.setCalloutTone(calloutPos(editor), 'danger')
    editor.commands.setCalloutEmoji(calloutPos(editor), '🔥')
    expect(calloutAt(editor).attrs).toEqual({tone: 'danger', emoji: '🔥'})
    editor.commands.setCalloutEmoji(calloutPos(editor), null)
    expect(calloutAt(editor).attrs.emoji).toBeNull()
  })

  test('toggleCalloutTitle adds then removes a title, keeping its text', () => {
    const editor = mount([callout('tip', [p('x')])])
    editor.commands.toggleCalloutTitle(calloutPos(editor))
    editor.commands.insertContent('Hi')
    expect(calloutAt(editor).child(0).type.name).toBe('calloutTitle')
    editor.commands.toggleCalloutTitle(calloutPos(editor))
    expect(texts(calloutAt(editor))).toEqual(['Hi', 'x'])
    expect(calloutAt(editor).child(0).type.name).toBe('paragraph')
  })

  test('toggleCalloutTitle removes an empty title', () => {
    const editor = mount([callout('tip', [title(''), p('x')])])
    editor.commands.toggleCalloutTitle(calloutPos(editor))
    expect(texts(calloutAt(editor))).toEqual(['x'])
  })

  test('unsetCallout unwraps the callout', () => {
    const editor = mount([callout('info', [title('Head'), p('body')])], caretAfter('bo'))
    editor.commands.unsetCallout(calloutPos(editor))
    expect(blocksAfterTitle(editor)).toEqual(normalize([pBold('Head'), p('body'), TRAILING_LINE]))
    expect(editor.state.selection.from).toBe(caretAfter('bo')(editor.state.doc))
  })
})
