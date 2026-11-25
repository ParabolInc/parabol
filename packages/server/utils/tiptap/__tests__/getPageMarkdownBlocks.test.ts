import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import type {DataLoaderWorker} from '../../../graphql/graphql'
import {Logger} from '../../Logger'
import {getPageContent} from '../getPageContent'
import {getPageMarkdownBlocks} from '../getPageMarkdownBlocks'
import {parsePageMarkdown} from '../parsePageMarkdown'

jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: async () => undefined}
}))

const text = (value: string, marks?: JSONContent['marks']): JSONContent => ({
  type: 'text',
  text: value,
  ...(marks ? {marks} : {})
})
const paragraph = (...content: JSONContent[]): JSONContent => ({type: 'paragraph', content})
const cell = (type: 'tableHeader' | 'tableCell', value: string): JSONContent => ({
  type,
  content: [paragraph(text(value))]
})
const table: JSONContent = {
  type: 'table',
  content: [
    {type: 'tableRow', content: [cell('tableHeader', 'Name'), cell('tableHeader', 'Owner')]},
    {type: 'tableRow', content: [cell('tableCell', 'Alpha'), cell('tableCell', 'Ann')]}
  ]
}
const tableMarkdown = '| Name  | Owner |\n| ----- | ----- |\n| Alpha | Ann   |'

const readMarkdown = (doc: Y.Doc) => {
  const yDoc = Y.encodeStateAsUpdate(doc)
  const dataLoader = {get: () => ({load: async () => ({yDoc})})} as unknown as DataLoaderWorker
  return getPageContent(1, 'markdown', dataLoader)
}

describe('getPageMarkdownBlocks', () => {
  test('serializes each block alone, without its outer newlines', () => {
    const blocks = getPageMarkdownBlocks([
      {type: 'heading', attrs: {level: 1}, content: [text('Plan')]},
      {type: 'paragraph'},
      table
    ])
    expect(blocks).toEqual(['# Plan', '', tableMarkdown])
  })

  test('writes a block that cannot be serialized as nothing, and logs it', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
    const blocks = getPageMarkdownBlocks([
      paragraph(text('Kept')),
      {type: 'bulletList', content: [{type: 'listItem', content: []}]}
    ])
    expect(blocks).toEqual(['Kept', ''])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bulletList'))
    warn.mockRestore()
  })

  test('writes & < > as typed where Markdown reads them as plain text', () => {
    const blocks = getPageMarkdownBlocks([
      paragraph(text('Tom & Jerry')),
      paragraph(text('a < b > c')),
      {type: 'heading', attrs: {level: 2}, content: [text('Q&A for R&D')]},
      paragraph(text('AT&T', [{type: 'bold'}]), text(' rocks'))
    ])
    expect(blocks).toEqual(['Tom & Jerry', 'a < b > c', '## Q&A for R&D', '**AT&T** rocks'])
  })

  test('escapes & < > only where Markdown would read an entity, a tag or a quote', () => {
    const blocks = getPageMarkdownBlocks([
      paragraph(text('&copy; and &#39;')),
      paragraph(text('<b>bold</b>')),
      paragraph(text('> not a quote')),
      paragraph(text('x_y*z [br] ~t~ `c`'))
    ])
    expect(blocks).toEqual([
      '&amp;copy; and &amp;#39;',
      '&lt;b>bold&lt;/b>',
      '&gt; not a quote',
      'x\\_y\\*z \\[br\\] \\~t\\~ \\`c\\`'
    ])
  })

  test('keeps code as written', () => {
    const blocks = getPageMarkdownBlocks([
      paragraph(text('a &amp; <b>', [{type: 'code'}])),
      {type: 'codeBlock', attrs: {language: null}, content: [text('a &amp; <b>')]}
    ])
    expect(blocks).toEqual(['`a &amp; <b>`', '```\na &amp; <b>\n```'])
  })

  const readBack = (...content: JSONContent[]) => {
    const markdown = getPageMarkdownBlocks([paragraph(...content)]).join('\n\n')
    const [block] = parsePageMarkdown(markdown, new Set())
    return (block?.content ?? [])
      .map((node) => (node.type === 'hardBreak' ? '\n' : node.text))
      .join('')
  }

  test.each([
    'Tom & Jerry',
    'a < b > c',
    '&copy; &amp; &#39; &#x27;',
    '<b>bold</b> <https://x.test> <!-- note -->',
    '> quote',
    '  > indented quote',
    'x_y*z [br] ~t~ `c` \\&amp;'
  ])('%j reads back exactly', (value) => {
    expect(readBack(text(value))).toBe(value)
  })

  test('reads back & < > exactly across a line break or a mark Markdown does not write', () => {
    const textStyle = [{type: 'textStyle', attrs: {color: 'red'}}]
    expect(readBack(text('a'), {type: 'hardBreak'}, text('> b'))).toBe('a\n> b')
    expect(readBack(text('AT'), text('&', textStyle), text('amp;'))).toBe('AT&amp;')
    expect(readBack(text('<', textStyle), text('b>'))).toBe('<b>')
  })
})

describe('getPageContent', () => {
  test('reads markdown as its blocks separated by one blank line', async () => {
    const doc = TiptapTransformer.toYdoc(
      {
        type: 'doc',
        content: [
          paragraph(text('Intro')),
          {type: 'paragraph'},
          {type: 'paragraph'},
          paragraph(text('Before table')),
          table
        ]
      },
      'default',
      serverTipTapExtensions
    )
    const markdown = await readMarkdown(doc)
    expect(markdown).not.toContain('&nbsp;')
    expect(markdown).toBe(`Intro\n\n\n\n\n\nBefore table\n\n${tableMarkdown}`)
  })

  test('reads the valid blocks of a page holding a text node at its root', async () => {
    const doc = new Y.Doc()
    const before = new Y.XmlElement('paragraph')
    before.insert(0, [new Y.XmlText('Before')])
    const after = new Y.XmlElement('paragraph')
    after.insert(0, [new Y.XmlText('After')])
    doc.getXmlFragment('default').insert(0, [before, new Y.XmlText('loose'), after])
    await expect(readMarkdown(doc)).resolves.toBe('Before\n\n\n\nAfter')
  })
})
