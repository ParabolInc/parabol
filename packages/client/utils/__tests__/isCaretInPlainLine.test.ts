import {Editor, type JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import isCaretInPlainLine from '../isCaretInPlainLine'

const text = (value: string) => [{type: 'text', text: value}]

const caretAtEndOf = (content: JSONContent[], nodeText: string) => {
  const editor = new Editor({extensions: [StarterKit], content: {type: 'doc', content}})
  let target = 0
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === nodeText) target = pos + node.nodeSize
  })
  editor.commands.setTextSelection(target)
  return editor
}

test('a top-level paragraph is a plain line', () => {
  const editor = caretAtEndOf([{type: 'paragraph', content: text('Ship it')}], 'Ship it')
  expect(isCaretInPlainLine(editor)).toBe(true)
})

test('a second paragraph is still a plain line', () => {
  const editor = caretAtEndOf(
    [
      {type: 'paragraph', content: text('Ship it')},
      {type: 'paragraph', content: text('on Friday')}
    ],
    'on Friday'
  )
  expect(isCaretInPlainLine(editor)).toBe(true)
})

test('a list item is not', () => {
  const editor = caretAtEndOf(
    [
      {
        type: 'bulletList',
        content: [{type: 'listItem', content: [{type: 'paragraph', content: text('Rollback')}]}]
      }
    ],
    'Rollback'
  )
  expect(isCaretInPlainLine(editor)).toBe(false)
})

test('a quote, code block or heading is not', () => {
  const quote = caretAtEndOf(
    [{type: 'blockquote', content: [{type: 'paragraph', content: text('Said')}]}],
    'Said'
  )
  const code = caretAtEndOf([{type: 'codeBlock', content: text('npm test')}], 'npm test')
  const heading = caretAtEndOf(
    [{type: 'heading', attrs: {level: 3}, content: text('Plan')}],
    'Plan'
  )
  expect(isCaretInPlainLine(quote)).toBe(false)
  expect(isCaretInPlainLine(code)).toBe(false)
  expect(isCaretInPlainLine(heading)).toBe(false)
})
