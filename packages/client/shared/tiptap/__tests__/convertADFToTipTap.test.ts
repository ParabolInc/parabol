import {type AdfNode, convertADFToTipTap} from '../convertADFToTipTap'

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const doc = (content: AdfNode[]): AdfNode => ({type: 'doc', version: 1, content})

const panel = (panelType: string, content: AdfNode[]): AdfNode => ({
  type: 'panel',
  attrs: {panelType},
  content
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

  test('imports a panel as a blockquote that keeps its text', () => {
    expect(convertADFToTipTap(doc([panel('info', [paragraph('x')])]), 'T').content[1]).toEqual({
      type: 'blockquote',
      content: [paragraph('x')]
    })
  })
})
