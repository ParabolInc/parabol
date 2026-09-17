import type {JSONContent} from '@tiptap/core'
import {isEmptyAnswerDoc} from '../buildTeamPromptResponseContent'

const doc = (content: JSONContent[]): JSONContent => ({type: 'doc', content})
const paragraph = (content: JSONContent[] = []): JSONContent => ({type: 'paragraph', content})
const text = (value: string): JSONContent => ({type: 'text', text: value})

describe('isEmptyAnswerDoc', () => {
  it('treats an empty doc, empty paragraph or whitespace as empty', () => {
    expect(isEmptyAnswerDoc(doc([]))).toBe(true)
    expect(isEmptyAnswerDoc(doc([paragraph()]))).toBe(true)
    expect(isEmptyAnswerDoc(doc([paragraph([text('  \n\t ')])]))).toBe(true)
  })

  it('treats line breaks and an abandoned upload placeholder as empty', () => {
    expect(isEmptyAnswerDoc(doc([paragraph([{type: 'hardBreak'}])]))).toBe(true)
    expect(isEmptyAnswerDoc(doc([{type: 'fileUpload'}]))).toBe(true)
  })

  it('treats text, including nested list text, as content', () => {
    expect(isEmptyAnswerDoc(doc([paragraph([text('hi')])]))).toBe(false)
    expect(
      isEmptyAnswerDoc(
        doc([
          {
            type: 'bulletList',
            content: [{type: 'listItem', content: [paragraph([text('nested')])]}]
          }
        ])
      )
    ).toBe(false)
  })

  it.each([
    'mention',
    'taskTag',
    'pageUserMention',
    'popoverMention',
    'horizontalRule',
    'fileBlock',
    'imageBlock',
    'loom',
    'pageLinkBlock',
    'tableOfContents',
    'database',
    'taskBlock',
    'thinkingBlock',
    'responseBlock'
  ])('treats a %s atom as content', (type) => {
    expect(isEmptyAnswerDoc(doc([paragraph([{type}])]))).toBe(false)
  })
})
