import {getSchema} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import appOrigin from '../../appOrigin'
import markdownToTaskContent from '../markdownToTaskContent'

const schema = getSchema(serverTipTapExtensions)

const text = (value: string) => ({type: 'text', text: value})
const paragraph = (...content: object[]) => ({type: 'paragraph', content})
const getBlocks = (doc: string) => JSON.parse(doc).content as {type: string}[]

const TABLE = '| Who | Did |\n| - | - |\n| Ana | **Shipped** it |'

describe('markdownToTaskContent', () => {
  test('keeps a Parabol image that starts an ordered list item, in a valid doc', () => {
    const src = `${appOrigin}/assets/a.png`
    const doc = JSON.parse(markdownToTaskContent(`1. ![x](${src})`, 'task'))
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
    const [listItem] = doc.content[0].content
    expect(listItem.content.map(({type}: {type: string}) => type)).toEqual([
      'paragraph',
      'imageBlock'
    ])
    expect(listItem.content[1].attrs.src).toBe(src)
  })

  test.each(['task', 'comment', 'reflection'] as const)(
    'a table becomes one paragraph per row for a %s, whose editor shows no tables',
    (surface) => {
      expect(getBlocks(markdownToTaskContent(TABLE, surface))).toEqual([
        paragraph(text('Who'), text(' | '), text('Did')),
        paragraph(
          text('Ana'),
          text(' | '),
          {type: 'text', marks: [{type: 'bold'}], text: 'Shipped'},
          text(' it')
        )
      ])
    }
  )

  test('a table stays a table in a standup answer, whose editor shows tables', () => {
    expect(getBlocks(markdownToTaskContent(TABLE, 'standup')).map(({type}) => type)).toEqual([
      'table'
    ])
  })

  test.each(['task', 'comment', 'reflection', 'standup'] as const)(
    'a callout, which no %s editor shows, becomes its title and body',
    (surface) => {
      const doc = markdownToTaskContent(
        '> [!NOTE] Heads up\n> Deploys are slow\n> - Retry',
        surface
      )
      expect(getBlocks(doc)).toEqual([
        paragraph(text('Heads up')),
        paragraph(text('Deploys are slow')),
        {type: 'bulletList', content: [{type: 'listItem', content: [paragraph(text('Retry'))]}]}
      ])
    }
  )

  test('a comment gets the text of a checklist and a link for an image, which its editor lacks', () => {
    const src = `${appOrigin}/assets/a.png`
    const markdown = `- [x] Ship it\n\n![burndown](${src})`
    expect(getBlocks(markdownToTaskContent(markdown, 'comment'))).toEqual([
      paragraph(text('Ship it')),
      paragraph({
        type: 'text',
        text: 'burndown',
        marks: [
          expect.objectContaining({type: 'link', attrs: expect.objectContaining({href: src})})
        ]
      })
    ])
    expect(getBlocks(markdownToTaskContent(markdown, 'task')).map(({type}) => type)).toEqual([
      'taskList',
      'imageBlock'
    ])
  })

  test('a table inside a list item leaves a valid item that starts with its paragraph', () => {
    const doc = JSON.parse(
      markdownToTaskContent('- Notes\n\n  | a | b |\n  | - | - |\n  | 1 | 2 |', 'task')
    )
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
    expect(doc.content[0].content[0].content).toEqual([
      paragraph(text('Notes')),
      paragraph(text('a'), text(' | '), text('b')),
      paragraph(text('1'), text(' | '), text('2'))
    ])
  })

  test('a table leaves out its empty cells and rows', () => {
    expect(getBlocks(markdownToTaskContent('| a | | c |\n| - | - | - |\n| | | |', 'task'))).toEqual(
      [paragraph(text('a'), text(' | '), text('c'))]
    )
  })

  test('an empty table inside a quote leaves a valid doc', () => {
    const doc = JSON.parse(markdownToTaskContent('> | | |\n> | - | - |\n> | | |', 'comment'))
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
  })
})
