import type {Editor} from '@tiptap/core'
import answerPreview from '../answerPreview'

const editorWith = (text: string) => ({isDestroyed: false, getText: () => text}) as Editor

it('falls back to the saved answer when there is no editor', () => {
  expect(answerPreview(null, '  Shipped   the   thing ')).toBe('Shipped the thing')
})

it('prefers the live editor text', () => {
  expect(answerPreview(editorWith('live text'), 'saved text')).toBe('live text')
})

it('falls back to the saved answer when the editor is empty', () => {
  expect(answerPreview(editorWith('  \n '), 'saved text')).toBe('saved text')
})

it('ignores a destroyed editor', () => {
  const destroyed = {isDestroyed: true, getText: () => 'live'} as Editor
  expect(answerPreview(destroyed, 'saved text')).toBe('saved text')
})

it('truncates to 60 characters', () => {
  expect(answerPreview(null, 'x'.repeat(80))).toHaveLength(60)
})
