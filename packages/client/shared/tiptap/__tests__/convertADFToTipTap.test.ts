import {generateText, getSchema} from '@tiptap/core'
import {type AdfNode, convertADFToTipTap} from '../convertADFToTipTap'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

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
    const tipTapDoc = convertADFToTipTap(adf)
    expect(generateText(tipTapDoc, serverTipTapExtensions)).toContain('before')
  })

  test('never emits an empty text node for a text node at the top level', () => {
    const adf = {type: 'doc', content: [{type: 'text', text: ''}, paragraph('after')]}
    const tipTapDoc = convertADFToTipTap(adf, 'Title')
    expect(generateText(tipTapDoc, serverTipTapExtensions)).toContain('after')
  })

  test('falls back to the emoji shortName when its text is empty', () => {
    const adf = {
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'emoji', attrs: {shortName: ':smile:', text: ''}}]}
      ]
    }
    const tipTapDoc = convertADFToTipTap(adf, 'Title')
    expect(tipTapDoc.content[1]).toEqual({
      type: 'paragraph',
      content: [{type: 'text', text: ':smile:'}]
    })
  })

  test.each([
    ['sub', 'subscript'],
    ['sup', 'superscript']
  ])('imports a %s subsup mark as a %s mark', (scriptType, markType) => {
    const adf = doc([
      {
        type: 'paragraph',
        content: [{type: 'text', text: '2', marks: [{type: 'subsup', attrs: {type: scriptType}}]}]
      }
    ])
    const tipTapDoc = convertADFToTipTap(adf, 'Title')
    expect(tipTapDoc.content[1]).toEqual({
      type: 'paragraph',
      content: [{type: 'text', text: '2', marks: [{type: markType}]}]
    })
  })

  test('imports a panel as a blockquote that keeps its text', () => {
    expect(convertADFToTipTap(doc([panel('info', [paragraph('x')])]), 'T').content[1]).toEqual({
      type: 'blockquote',
      content: [paragraph('x')]
    })
  })

  test.each([
    ['strong', {type: 'strong'}],
    ['em', {type: 'em'}],
    ['strike', {type: 'strike'}],
    ['underline', {type: 'underline'}],
    ['code', {type: 'code'}],
    ['subscript', {type: 'subsup', attrs: {type: 'sub'}}],
    ['superscript', {type: 'subsup', attrs: {type: 'sup'}}],
    ['link', {type: 'link', attrs: {href: 'https://example.test/'}}],
    ['textColor', {type: 'textColor', attrs: {color: '#ff5630'}}],
    ['backgroundColor', {type: 'backgroundColor', attrs: {color: '#fffae6'}}]
  ])('keeps the text of a %s mark in a doc the schema accepts', (_label, mark) => {
    const adf = doc([{type: 'paragraph', content: [{type: 'text', text: 'H2O', marks: [mark]}]}])
    const tipTapDoc = convertADFToTipTap(adf, 'Title')
    expect(() => getSchema(serverTipTapExtensions).nodeFromJSON(tipTapDoc).check()).not.toThrow()
    expect(generateText(tipTapDoc, serverTipTapExtensions)).toContain('H2O')
  })
})
