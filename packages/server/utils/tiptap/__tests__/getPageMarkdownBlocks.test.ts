import {TiptapTransformer} from '@hocuspocus/transformer'
import {Editor, type JSONContent} from '@tiptap/core'
import * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import type {DataLoaderWorker} from '../../../graphql/graphql'
import {Logger} from '../../Logger'
import {getPageContent} from '../getPageContent'
import {getPageMarkdownBlocks} from '../getPageMarkdownBlocks'

jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: async () => undefined}
}))

const text = (value: string): JSONContent => ({type: 'text', text: value})
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

const withEditor = <T>(fn: (editor: Editor) => T) => {
  const editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: [{type: 'paragraph'}]},
    extensions: serverTipTapExtensions
  })
  try {
    return fn(editor)
  } finally {
    editor.destroy()
  }
}

const readMarkdown = (doc: Y.Doc) => {
  const yDoc = Y.encodeStateAsUpdate(doc)
  const dataLoader = {get: () => ({load: async () => ({yDoc})})} as unknown as DataLoaderWorker
  return getPageContent(1, 'markdown', dataLoader)
}

describe('getPageMarkdownBlocks', () => {
  test('serializes each block alone, without its outer newlines', () => {
    const blocks = withEditor((editor) =>
      getPageMarkdownBlocks(editor, [
        {type: 'heading', attrs: {level: 1}, content: [text('Plan')]},
        {type: 'paragraph'},
        table
      ])
    )
    expect(blocks).toEqual(['# Plan', '', tableMarkdown])
  })

  test('writes a block that cannot be serialized as nothing, and logs it', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
    const blocks = withEditor((editor) =>
      getPageMarkdownBlocks(editor, [
        paragraph(text('Kept')),
        {type: 'bulletList', content: [{type: 'listItem', content: []}]}
      ])
    )
    expect(blocks).toEqual(['Kept', ''])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bulletList'))
    warn.mockRestore()
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
