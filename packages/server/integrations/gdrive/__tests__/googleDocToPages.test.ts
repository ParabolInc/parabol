import type {docs_v1} from 'googleapis'
import {googleDocToPages} from '../googleDocToPages'

const SOFT_BREAK = '\u000b'

const run = (content: string, textStyle: docs_v1.Schema$TextStyle = {}) => ({
  textRun: {content, textStyle}
})
type ParagraphElement = docs_v1.Schema$ParagraphElement & {
  dateElement?: {dateElementProperties?: {displayText?: string | null}}
}

const para = (
  elements: ParagraphElement[],
  namedStyleType = 'NORMAL_TEXT',
  bullet?: docs_v1.Schema$Bullet
): docs_v1.Schema$StructuralElement => ({
  paragraph: {elements, paragraphStyle: {namedStyleType}, bullet}
})

const lists: {[key: string]: docs_v1.Schema$List} = {
  'kix.bullets': {
    listProperties: {
      nestingLevels: [{glyphSymbol: '●'}, {glyphSymbol: '○'}]
    }
  },
  'kix.numbers': {
    listProperties: {nestingLevels: [{glyphType: 'DECIMAL'}]}
  },
  'kix.mixed': {
    listProperties: {nestingLevels: [{glyphSymbol: '●'}, {glyphType: 'ALPHA'}]}
  }
}

const notesBody: docs_v1.Schema$StructuralElement[] = [
  {sectionBreak: {}},
  para([
    {
      dateElement: {
        dateElementProperties: {displayText: 'Jul 23, 2026'}
      }
    },
    run('\n')
  ]),
  para([run('Cycle Retro\n')], 'HEADING_2'),
  para([
    run('Invited '),
    {person: {personProperties: {name: 'Nick', email: 'nick@example.com'}}},
    run(' '),
    {person: {personProperties: {email: 'dale@example.com'}}},
    run('\n')
  ]),
  para([
    run('Attachments '),
    {richLink: {richLinkProperties: {title: 'Cycle Retro', uri: 'https://calendar.example.com/e'}}},
    run('\n')
  ]),
  para([run('\n')]),
  para([run('Summary\n')], 'HEADING_3'),
  para([
    run('The team reviewed '),
    run('interface refinements', {bold: true}),
    run(`.${SOFT_BREAK}Second line with `),
    run('emphasis', {italic: true}),
    run(' and '),
    run('gone', {strikethrough: true}),
    run('.\n')
  ]),
  para([run('Aligned\n')], 'SUBTITLE'),
  para([run('Top level item\n')], 'NORMAL_TEXT', {listId: 'kix.bullets'}),
  para([run('Nested item\n')], 'NORMAL_TEXT', {listId: 'kix.bullets', nestingLevel: 1}),
  para([run('Second top level\n')], 'NORMAL_TEXT', {listId: 'kix.bullets'}),
  para([run('Step one\n')], 'NORMAL_TEXT', {listId: 'kix.numbers'}),
  para([run('Step two\n')], 'NORMAL_TEXT', {listId: 'kix.numbers'}),
  para([
    run('Let us know: '),
    run('Helpful', {underline: true, link: {url: 'https://example.com/helpful'}}),
    run('\n')
  ]),
  para([{inlineObjectElement: {inlineObjectId: 'kix.img'}}, run('\n')]),
  {
    table: {
      tableRows: [{tableCells: [{content: [para([run('Cell text\n')])]}]}]
    }
  }
]

const doc: docs_v1.Schema$Document = {
  title: 'Cycle Retro - 2026/07/23 10:30 CDT - Notes by Gemini',
  tabs: [
    {
      tabProperties: {title: 'Notes', tabId: 't1'},
      documentTab: {body: {content: notesBody}, lists}
    },
    {
      tabProperties: {title: 'Transcript', tabId: 't2'},
      documentTab: {
        body: {
          content: [
            para([run('00:00:01', {bold: true}), run('\n')]),
            para([run('Nick: '), run('Hello everyone\n')])
          ]
        }
      }
    },
    {
      tabProperties: {title: 'Empty', tabId: 't3'},
      documentTab: {body: {content: [para([run('\n')]), para([run('   \n')])]}}
    }
  ]
}

describe('googleDocToPages', () => {
  const pages = googleDocToPages(doc)
  const notes = pages[0]!.content.content
  const text = (node: unknown) => JSON.stringify(node)

  it('creates one page per non-empty tab, titled after the tab, starting with an H1', () => {
    expect(pages.map((p) => p.title)).toEqual(['Notes', 'Transcript'])
    expect(notes[0]).toEqual({
      type: 'heading',
      attrs: {level: 1},
      content: [{type: 'text', text: 'Notes'}]
    })
    expect(pages[1]!.content.content[0]).toEqual({
      type: 'heading',
      attrs: {level: 1},
      content: [{type: 'text', text: 'Transcript'}]
    })
  })

  it('maps Docs paragraph styles to headings below H1', () => {
    const headings = notes
      .filter((n) => n.type === 'heading')
      .map((n) => `${(n as {attrs: {level: number}}).attrs.level}:${text(n.content)}`)
    expect(headings).toEqual([
      '1:[{"type":"text","text":"Notes"}]',
      '2:[{"type":"text","text":"Cycle Retro"}]',
      '3:[{"type":"text","text":"Summary"}]',
      '2:[{"type":"text","text":"Aligned"}]'
    ])
  })

  it('renders dates, people and rich links as text (rich links as links)', () => {
    expect(text(notes[1])).toContain('Jul 23, 2026')
    expect(text(notes[3])).toContain('"text":"Nick"')
    expect(text(notes[3])).toContain('"text":"dale@example.com"')
    expect(text(notes[4])).toContain('"text":"Cycle Retro"')
    expect(text(notes[4])).toContain('"href":"https://calendar.example.com/e"')
  })

  it('preserves marks and splits soft line breaks into paragraphs', () => {
    const summaryIdx = notes.findIndex((n) => text(n).includes('Summary'))
    const first = notes[summaryIdx + 1]!
    const second = notes[summaryIdx + 2]!
    expect(text(first)).toContain('"text":"interface refinements","marks":[{"type":"bold"}]')
    expect(text(first)).not.toContain('Second line')
    expect(text(second)).toContain('"text":"emphasis","marks":[{"type":"italic"}]')
    expect(text(second)).toContain('"text":"gone","marks":[{"type":"strike"}]')
  })

  it('builds nested bullet lists and ordered lists', () => {
    const bullets = notes.find((n) => n.type === 'bulletList') as {content: unknown[]}
    expect(bullets.content).toHaveLength(2)
    expect(text(bullets.content[0])).toContain('Top level item')
    expect(text(bullets.content[0])).toContain('"type":"bulletList"')
    expect(text(bullets.content[0])).toContain('Nested item')
    expect(text(bullets.content[1])).toContain('Second top level')
    const ordered = notes.find((n) => n.type === 'orderedList') as {content: unknown[]}
    expect(ordered.content).toHaveLength(2)
    expect(text(ordered)).toContain('Step one')
  })

  it('turns text links into link marks and keeps table cell text', () => {
    expect(text(notes)).toContain('"href":"https://example.com/helpful"')
    expect(text(notes)).toContain('Cell text')
  })

  it('drops empty paragraphs and images', () => {
    expect(notes.some((n) => n.type === 'paragraph' && !n.content)).toBe(false)
    expect(text(notes)).not.toContain('kix.img')
  })

  it('demotes orphaned deeper bullets and nests ordered lists by level', () => {
    const [page] = googleDocToPages({
      title: 'Lists',
      body: {
        content: [
          para([run('Orphan at level 1\n')], 'NORMAL_TEXT', {listId: 'kix.mixed', nestingLevel: 1}),
          para([run('Root\n')], 'NORMAL_TEXT', {listId: 'kix.mixed'}),
          para([run('Jumped to level 2\n')], 'NORMAL_TEXT', {listId: 'kix.mixed', nestingLevel: 2})
        ]
      },
      lists
    })
    const list = page!.content.content[1] as {type: string; content: {content: unknown[]}[]}
    expect(list.type).toBe('bulletList')
    expect(list.content).toHaveLength(2)
    expect(text(list.content[0])).toContain('Orphan at level 1')
    expect(list.content[0]!.content).toHaveLength(1)
    const rootItem = list.content[1]!
    expect(text(rootItem.content[0])).toContain('Root')
    expect(text(rootItem.content[1])).toContain('"type":"orderedList"')
    expect(text(rootItem.content[1])).toContain('Jumped to level 2')
  })

  it('uses the document title for tabs Google left unnamed', () => {
    const [page] = googleDocToPages({
      title: 'Plain doc',
      tabs: [
        {
          tabProperties: {title: 'Tab 1', tabId: 't1'},
          documentTab: {body: {content: [para([run('Hello\n')])]}}
        }
      ]
    })
    expect(page!.title).toBe('Plain doc')
  })

  it('falls back to the top-level body and document title when a doc has no tabs', () => {
    const legacy = googleDocToPages({
      title: 'Old style notes',
      body: {content: [para([run('Hello\n')])]}
    })
    expect(legacy).toHaveLength(1)
    expect(legacy[0]!.title).toBe('Old style notes')
    expect(text(legacy[0]!.content)).toContain('Hello')
  })
})
