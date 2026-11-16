import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {renameSyncedBlock} from '../renameSyncedBlock'

const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

const blockEditor = (content: object[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit],
    content: {type: 'doc', content}
  })

test('replaces the first heading with the new name', () => {
  const editor = blockEditor([heading('Escalation'), paragraph('Sev 1')])
  expect(renameSyncedBlock(editor, '  Escalation path ')).toBe(true)
  expect(editor.state.doc.firstChild?.textContent).toBe('Escalation path')
  expect(editor.state.doc.child(1).textContent).toBe('Sev 1')
})

test('inserts a heading when the document has none', () => {
  const editor = blockEditor([paragraph('Sev 1')])
  renameSyncedBlock(editor, 'Escalation path')
  expect(editor.state.doc.firstChild?.type.name).toBe('heading')
  expect(editor.state.doc.firstChild?.textContent).toBe('Escalation path')
  expect(editor.state.doc.child(1).textContent).toBe('Sev 1')
})

test('does nothing when the name is unchanged', () => {
  const editor = blockEditor([heading('Escalation'), paragraph('Sev 1')])
  expect(renameSyncedBlock(editor, 'Escalation')).toBe(false)
  expect(renameSyncedBlock(editor, ' Escalation ')).toBe(false)
})

test('an empty name clears the heading text', () => {
  const editor = blockEditor([heading('Escalation'), paragraph('Sev 1')])
  expect(renameSyncedBlock(editor, '   ')).toBe(true)
  expect(editor.state.doc.firstChild?.type.name).toBe('heading')
  expect(editor.state.doc.firstChild?.textContent).toBe('')
  expect(renameSyncedBlock(editor, '')).toBe(false)
})
