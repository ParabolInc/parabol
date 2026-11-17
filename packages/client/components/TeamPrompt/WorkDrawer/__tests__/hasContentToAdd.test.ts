import type {JSONContent} from '@tiptap/core'
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import hasContentToAdd from '../hasContentToAdd'

const editorWith = (content: JSONContent[]) =>
  new Editor({extensions: [StarterKit], content: {type: 'doc', content}})

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

describe('hasContentToAdd', () => {
  it('is true while the card still holds written text', () => {
    expect(hasContentToAdd(editorWith([paragraph('Shipped the migration')]))).toBe(true)
  })

  it('is false for the single empty paragraph an emptied card keeps', () => {
    expect(hasContentToAdd(editorWith([{type: 'paragraph'}]))).toBe(false)
  })

  it('is false once every paragraph is emptied, not only the last', () => {
    expect(hasContentToAdd(editorWith([{type: 'paragraph'}, {type: 'paragraph'}]))).toBe(false)
  })

  it('is true for text followed by the empty paragraph the editor appends', () => {
    expect(hasContentToAdd(editorWith([paragraph('alpha'), {type: 'paragraph'}]))).toBe(true)
  })

  it('is true for a trailing block that is not a paragraph', () => {
    const horizontalRule = {type: 'horizontalRule'}
    expect(hasContentToAdd(editorWith([paragraph('alpha'), horizontalRule]))).toBe(true)
  })
})
