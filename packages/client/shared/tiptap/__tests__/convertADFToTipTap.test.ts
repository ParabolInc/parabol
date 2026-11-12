import {generateText} from '@tiptap/core'
import {convertADFToTipTap} from '../convertADFToTipTap'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

describe('convertADFToTipTap', () => {
  test('drops mediaSingle attachments and keeps the surrounding text', () => {
    const adf = {
      type: 'doc',
      version: 1,
      content: [
        paragraph('before'),
        {
          type: 'mediaSingle',
          attrs: {layout: 'center'},
          content: [{type: 'media', attrs: {id: 'made-up-id', type: 'file', collection: ''}}]
        },
        paragraph('after')
      ]
    }
    const doc = convertADFToTipTap(adf, 'Title')
    expect(doc.content).toEqual([
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]},
      {type: 'paragraph', content: [{type: 'text', text: 'before'}]},
      {type: 'paragraph', content: [{type: 'text', text: 'after'}]}
    ])
  })

  test.each(['mediaGroup', 'media'])('drops %s nodes', (type) => {
    const adf = {type: 'doc', content: [{type, content: []}, paragraph('text')]}
    const doc = convertADFToTipTap(adf, 'Title')
    expect(doc.content).toHaveLength(2)
  })

  test.each(['blockCard', 'embedCard'])('turns %s into a linked paragraph', (type) => {
    const adf = {type: 'doc', content: [{type, attrs: {url: 'https://example.com/page'}}]}
    const doc = convertADFToTipTap(adf, 'Title')
    expect(doc.content[1]).toEqual({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'https://example.com/page',
          marks: [{type: 'link', attrs: {href: 'https://example.com/page'}}]
        }
      ]
    })
  })

  test.each([
    ['a text node with no text', {type: 'text', text: ''}],
    ['a mention with an empty label', {type: 'mention', attrs: {id: 'made-up-id', text: ''}}],
    ['an emoji with an empty text', {type: 'emoji', attrs: {shortName: '', text: ''}}],
    ['an inlineCard with data instead of a url', {type: 'inlineCard', attrs: {data: {}}}]
  ])('never emits an empty text node for %s', (_label, inlineNode) => {
    const adf = {
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'before '}, inlineNode]},
        {type: 'heading', attrs: {level: 2}, content: [inlineNode]},
        {
          type: 'bulletList',
          content: [{type: 'listItem', content: [{type: 'paragraph', content: [inlineNode]}]}]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [{type: 'tableCell', content: [{type: 'paragraph', content: [inlineNode]}]}]
            }
          ]
        }
      ]
    }
    const doc = convertADFToTipTap(adf)
    expect(generateText(doc, serverTipTapExtensions)).toContain('before')
  })

  test('never emits an empty text node for a text node at the top level', () => {
    const adf = {type: 'doc', content: [{type: 'text', text: ''}, paragraph('after')]}
    const doc = convertADFToTipTap(adf, 'Title')
    expect(generateText(doc, serverTipTapExtensions)).toContain('after')
  })

  test('falls back to the emoji shortName when its text is empty', () => {
    const adf = {
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'emoji', attrs: {shortName: ':smile:', text: ''}}]}
      ]
    }
    const doc = convertADFToTipTap(adf, 'Title')
    expect(doc.content[1]).toEqual({type: 'paragraph', content: [{type: 'text', text: ':smile:'}]})
  })
})
