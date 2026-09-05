import type {JSONContent} from '@tiptap/core'
import {isEmptyAnswerDoc} from '../isEmptyAnswerDoc'

const doc = (content: JSONContent[]): JSONContent => ({type: 'doc', content})
const paragraph = (content: JSONContent[] = []): JSONContent => ({type: 'paragraph', content})
const text = (value: string): JSONContent => ({type: 'text', text: value})

describe('isEmptyAnswerDoc', () => {
  it('treats an empty doc as empty', () => {
    expect(isEmptyAnswerDoc(doc([]))).toBe(true)
  })

  it('treats a doc with only an empty paragraph as empty', () => {
    expect(isEmptyAnswerDoc(doc([paragraph()]))).toBe(true)
  })

  it('treats a whitespace-only paragraph as empty', () => {
    expect(isEmptyAnswerDoc(doc([paragraph([text('   \n\t ')])]))).toBe(true)
  })

  it('treats a paragraph with real text as non-empty', () => {
    expect(isEmptyAnswerDoc(doc([paragraph([text('hi')])]))).toBe(false)
  })

  it('treats a doc whose only node is an abandoned upload placeholder as empty', () => {
    expect(isEmptyAnswerDoc(doc([{type: 'fileUpload'}]))).toBe(true)
  })

  it.each([
    'database',
    'emojiMention',
    'fileBlock',
    'horizontalRule',
    'image',
    'imageBlock',
    'insightsBlock',
    'loom',
    'mention',
    'pageLinkBlock',
    'pageUserMention',
    'popoverMention',
    'responseBlock',
    'tableOfContents',
    'taskBlock',
    'taskTag',
    'thinkingBlock'
  ])('treats a doc containing a %s atom as non-empty', (type) => {
    expect(isEmptyAnswerDoc(doc([paragraph([{type}])]))).toBe(false)
  })

  it('treats a nested list with real text as non-empty', () => {
    const nestedList = doc([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              paragraph([text('parent')]),
              {
                type: 'bulletList',
                content: [{type: 'listItem', content: [paragraph([text('child')])]}]
              }
            ]
          }
        ]
      }
    ])
    expect(isEmptyAnswerDoc(nestedList)).toBe(false)
  })

  it('treats a nested list with only whitespace as empty', () => {
    const nestedList = doc([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              paragraph([text(' ')]),
              {
                type: 'bulletList',
                content: [{type: 'listItem', content: [paragraph()]}]
              }
            ]
          }
        ]
      }
    ])
    expect(isEmptyAnswerDoc(nestedList)).toBe(true)
  })
})
