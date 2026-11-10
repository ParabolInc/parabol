import {type AdfNode, convertADFToTipTap} from '../convertADFToTipTap'

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const doc = (content: AdfNode[]): AdfNode => ({type: 'doc', version: 1, content})

const panel = (
  panelType: string,
  content: AdfNode[],
  attrs: Record<string, unknown> = {}
): AdfNode => ({
  type: 'panel',
  attrs: {panelType, ...attrs},
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

  test('imports each preset panel as the matching callout tone', () => {
    const tones = ['info', 'note', 'success', 'tip', 'warning', 'error'].map(
      (panelType) => convertADFToTipTap(doc([panel(panelType, [paragraph('x')])]), 'T').content[1]
    )
    expect(tones.map((node) => (node && 'attrs' in node ? node.attrs : undefined))).toEqual([
      {tone: 'info', emoji: null},
      {tone: 'important', emoji: null},
      {tone: 'tip', emoji: null},
      {tone: 'tip', emoji: null},
      {tone: 'warning', emoji: null},
      {tone: 'danger', emoji: null}
    ])
    expect(tones.every((node) => node?.type === 'callout')).toBe(true)
  })

  test('imports a custom panel as plain and keeps its emoji', () => {
    const node = convertADFToTipTap(
      doc([panel('custom', [paragraph('x')], {panelIconText: '🚀'})]),
      'T'
    ).content[1]
    expect(node).toMatchObject({type: 'callout', attrs: {tone: 'plain', emoji: '🚀'}})
  })

  test('a panel with no content still yields a valid callout', () => {
    expect(convertADFToTipTap(doc([panel('info', [])]), 'T').content[1]).toMatchObject({
      type: 'callout',
      content: [{type: 'paragraph'}]
    })
  })

  test('children a callout cannot hold are emitted after it', () => {
    const table = {
      type: 'table',
      content: [{type: 'tableRow', content: [{type: 'tableCell', content: [paragraph('c')]}]}]
    }
    const content = convertADFToTipTap(doc([panel('info', [paragraph('x'), table])]), 'T').content
    expect(content.map((node) => node.type)).toEqual(['heading', 'callout', 'table'])
    expect(content[1]).toMatchObject({content: [{type: 'paragraph'}]})
  })
})
