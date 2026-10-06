import type {JSONContent} from '@tiptap/core'
import {splitTipTapContent} from '../splitTipTapContent'

const text = (value: string) => ({type: 'text', text: value})
const paragraph = (...content: JSONContent[]) => ({type: 'paragraph', content})
const blankParagraph = {type: 'paragraph'}
const taskTag = (id: string) => ({
  type: 'taskTag',
  attrs: {id, label: null, mentionSuggestionChar: '#'}
})
const bulletList = (...items: string[]) => ({
  type: 'bulletList',
  content: items.map((item) => ({type: 'listItem', content: [paragraph(text(item))]}))
})
const split = (...content: JSONContent[]) => splitTipTapContent({type: 'doc', content})

describe('splitTipTapContent', () => {
  it('splits the first block into the title and the rest into the body', () => {
    const {title, bodyContent, isTitleExcerpt} = split(
      paragraph(text('Fix the widget')),
      paragraph(text('It wobbles')),
      bulletList('on mobile', 'on desktop')
    )
    expect(title).toBe('Fix the widget')
    expect(bodyContent?.content).toEqual([
      paragraph(text('It wobbles')),
      bulletList('on mobile', 'on desktop')
    ])
    expect(isTitleExcerpt).toBe(false)
  })

  it('leaves the body empty when the title says it all', () => {
    expect(split(paragraph(text('Fix the widget')))).toEqual({
      title: 'Fix the widget',
      bodyContent: null,
      isTitleExcerpt: false
    })
  })

  it('does not count a block of only task tags as a body', () => {
    const {title, bodyContent} = split(
      paragraph(text('Fix the widget')),
      paragraph(taskTag('private'))
    )
    expect(title).toBe('Fix the widget')
    expect(bodyContent).toBeNull()
  })

  it('skips blank lines', () => {
    const {title, bodyContent} = split(
      blankParagraph,
      paragraph(text('Fix the widget')),
      blankParagraph,
      paragraph(text('It wobbles')),
      blankParagraph
    )
    expect(title).toBe('Fix the widget')
    expect(bodyContent?.content).toEqual([paragraph(text('It wobbles'))])
  })

  it('keeps a body that has no text of its own', () => {
    const image = {type: 'imageBlock', attrs: {src: 'https://example.com/wobble.png'}}
    const {title, bodyContent} = split(paragraph(text('Fix the widget')), image)
    expect(title).toBe('Fix the widget')
    expect(bodyContent?.content).toEqual([image])
  })

  it('leaves task tag chips out of both the title and the body', () => {
    const {title, bodyContent} = split(
      paragraph(text('Fix the widget '), taskTag('private')),
      paragraph(taskTag('archived'), text(' It wobbles'))
    )
    expect(title).toBe('Fix the widget')
    expect(JSON.stringify(bodyContent)).not.toContain('taskTag')
    expect(JSON.stringify(bodyContent)).toContain('It wobbles')
  })

  it('joins a title typed across soft line breaks', () => {
    const {title, bodyContent} = split(
      paragraph(text('Fix the widget'), {type: 'hardBreak'}, text('before launch'))
    )
    expect(title).toBe('Fix the widget before launch')
    expect(bodyContent).toBeNull()
  })

  it('moves everything to the body when the first block is too long for a title', () => {
    const longBlock = paragraph(text('wobble '.repeat(60)))
    const details = paragraph(text('It wobbles'))
    const {title, bodyContent, isTitleExcerpt} = split(longBlock, details)
    expect(title).toHaveLength(255)
    expect(bodyContent?.content).toEqual([longBlock, details])
    expect(isTitleExcerpt).toBe(true)
  })

  it('accepts a first block exactly as long as the limit', () => {
    const {title, bodyContent, isTitleExcerpt} = splitTipTapContent(
      {type: 'doc', content: [paragraph(text('a'.repeat(20)))]},
      20
    )
    expect(title).toBe('a'.repeat(20))
    expect(bodyContent).toBeNull()
    expect(isTitleExcerpt).toBe(false)
  })

  it('has no title or body for an empty task', () => {
    expect(split(blankParagraph, paragraph(taskTag('private')))).toEqual({
      title: '',
      bodyContent: null,
      isTitleExcerpt: false
    })
  })
})
