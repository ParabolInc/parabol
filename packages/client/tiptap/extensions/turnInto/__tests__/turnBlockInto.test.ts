import {Editor, getSchema} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {Node, type Schema} from '@tiptap/pm/model'
import {EditorState, TextSelection} from '@tiptap/pm/state'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {isLocalEmbedSource, localEmbedSourcesPlugin} from '../../fileBlock/localEmbedSources'
import {
  canTurnIntoPage,
  getSelectionTurnIntoPos,
  getTurnIntoTarget,
  type TurnIntoTarget,
  turnBlockInto
} from '../turnBlockInto'
import {turnIntoRows} from '../turnIntoRows'

const pagesExtensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) =>
    extension.name === 'starterKit'
      ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
      : extension
  )
]
const schema: Schema = getSchema(pagesExtensions)

type Json = Record<string, unknown>
const text = (value: string, marks?: string[]): Json => ({
  type: 'text',
  text: value,
  ...(marks ? {marks: marks.map((type) => ({type}))} : {})
})
const inline = (content: string | Json[]) =>
  typeof content === 'string' ? (content ? [text(content)] : []) : content
const p = (content: string | Json[] = '') => ({type: 'paragraph', content: inline(content)})
const h = (level: number, content: string | Json[] = '') => ({
  type: 'heading',
  attrs: {level},
  content: inline(content)
})
const code = (value = '') => ({type: 'codeBlock', content: value ? [text(value)] : []})
const li = (first: string | Json[], ...rest: Json[]) => ({
  type: 'listItem',
  content: [p(first), ...rest]
})
const ti = (first: string | Json[], ...rest: Json[]) => ({
  type: 'taskItem',
  attrs: {checked: false},
  content: [p(first), ...rest]
})
const asItems = (items: (string | Json)[], make: typeof li) =>
  items.map((item) => (typeof item === 'string' ? make(item) : item))
const ul = (...items: (string | Json)[]) => ({type: 'bulletList', content: asItems(items, li)})
const ol = (...items: (string | Json)[]) => ({type: 'orderedList', content: asItems(items, li)})
const tl = (...items: (string | Json)[]) => ({type: 'taskList', content: asItems(items, ti)})
const quote = (...content: Json[]) => ({type: 'blockquote', content})
const details = (summary: string | Json[], ...content: Json[]) => ({
  type: 'details',
  attrs: {open: true},
  content: [
    {type: 'detailsSummary', content: inline(summary)},
    {type: 'detailsContent', content: content.length ? content : [p()]}
  ]
})
const image = {type: 'imageBlock', attrs: {src: 'https://example.com/a.png'}}
const pageLink = (pageCode: number, title: string) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title, canonical: true}
})
const mention = (label: string) => ({
  type: 'pageUserMention',
  attrs: {id: 'user1', label}
})
const hardBreak = {type: 'hardBreak'}
const cell = (...content: Json[]) => ({type: 'tableCell', content})
const table = (...content: Json[]) => ({
  type: 'table',
  content: [{type: 'tableRow', content: [cell(...content)]}]
})

const TITLE = h(1, 'Title')
const makeDoc = (...blocks: Json[]) =>
  schema.nodeFromJSON({type: 'doc', content: [TITLE, ...blocks]})
const makeState = (...blocks: Json[]) => EditorState.create({doc: makeDoc(...blocks)})
const FIRST_BLOCK_POS = makeDoc().child(0).nodeSize

const findPos = (doc: Node, label: string, type: string) => {
  let found = -1
  doc.descendants((node, pos) => {
    const isMatch = pos > 0 && node.type.name === type && node.textContent.startsWith(label)
    if (isMatch && found === -1) found = pos
  })
  if (found === -1) throw new Error(`No ${type} starting with ${label}`)
  return found
}

const TEXT: TurnIntoTarget = {type: 'paragraph'}
const H2: TurnIntoTarget = {type: 'heading', level: 2}
const H3: TurnIntoTarget = {type: 'heading', level: 3}
const PAGE: TurnIntoTarget = {type: 'pageLinkBlock'}
const BULLET: TurnIntoTarget = {type: 'bulletList'}
const NUMBERED: TurnIntoTarget = {type: 'orderedList'}
const TODO: TurnIntoTarget = {type: 'taskList'}
const DETAILS: TurnIntoTarget = {type: 'details'}
const CODE: TurnIntoTarget = {type: 'codeBlock'}
const QUOTE: TurnIntoTarget = {type: 'blockquote'}
const ALL_TARGETS = turnIntoRows.map(({target}) => target)

const convert = (state: EditorState, pos: number, target: TurnIntoTarget) => {
  const tr = turnBlockInto(state, pos, target)
  if (!tr) throw new Error(`Expected a transaction for ${target.type}`)
  tr.doc.check()
  return tr
}
const convertBlock = (
  blocks: Json[],
  label: string,
  target: TurnIntoTarget,
  type = 'paragraph'
) => {
  const state = makeState(...blocks)
  return convert(state, findPos(state.doc, label, type), target)
}
const expectBlocks = (doc: Node, ...blocks: Json[]) => {
  expect(doc.toJSON()).toEqual(makeDoc(...blocks).toJSON())
}

describe('list items', () => {
  const list = ul('one', 'two', 'three')
  test.each([
    [TEXT, [ul('one'), p('two'), ul('three')]],
    [H2, [ul('one'), h(2, 'two'), ul('three')]],
    [NUMBERED, [ul('one'), ol('two'), ul('three')]],
    [TODO, [ul('one'), tl('two'), ul('three')]],
    [QUOTE, [ul('one'), quote(p('two')), ul('three')]],
    [CODE, [ul('one'), code('two'), ul('three')]],
    [DETAILS, [ul('one'), details('two'), ul('three')]]
  ] as [TurnIntoTarget, Json[]][])('the list splits around an item, as %j', (target, expected) => {
    expectBlocks(convertBlock([list], 'two', target, 'listItem').doc, ...expected)
  })

  test('the first and last items leave no empty list behind', () => {
    expectBlocks(convertBlock([list], 'one', TEXT, 'listItem').doc, p('one'), ul('two', 'three'))
    expectBlocks(convertBlock([list], 'three', TEXT, 'listItem').doc, ul('one', 'two'), p('three'))
  })

  test('a sole item replaces its list', () => {
    expectBlocks(convertBlock([ul('only')], 'only', H2, 'listItem').doc, h(2, 'only'))
  })

  test('a body follows as siblings for a target with no room for it', () => {
    const nested = ul('one', li('two', ul('nestA', 'nestB')), 'three')
    expectBlocks(
      convertBlock([nested], 'two', H2, 'listItem').doc,
      ul('one'),
      h(2, 'two'),
      ul('nestA', 'nestB', 'three')
    )
  })

  test('a body stays nested for a list target', () => {
    const nested = ul('one', li('two', ul('nestA', 'nestB')), 'three')
    expectBlocks(
      convertBlock([nested], 'two', TODO, 'listItem').doc,
      ul('one'),
      tl(ti('two', ul('nestA', 'nestB'))),
      ul('three')
    )
  })

  test('a nested item converts at its own depth', () => {
    const nested = ul('one', li('two', ul('nestA', 'nestB')), 'three')
    expectBlocks(
      convertBlock([nested], 'nestB', TEXT, 'listItem').doc,
      ul('one', li('two', ul('nestA'), p('nestB')), 'three')
    )
  })

  test('a second paragraph in an item converts in place', () => {
    expectBlocks(convertBlock([ul(li('one', p('two')))], 'two', H2).doc, ul(li('one', h(2, 'two'))))
  })

  test('leaving a to-do drops its checked state', () => {
    const checked = {type: 'taskItem', attrs: {checked: true}, content: [p('done')]}
    expectBlocks(convertBlock([tl(checked)], 'done', BULLET, 'taskItem').doc, ul('done'))
  })
})

describe('joining lists', () => {
  test.each([
    [NUMBERED, ol('one', 'two'), ol('one', 'two', 'x')],
    [BULLET, ul('one', 'two'), ul('one', 'two', 'x')],
    [TODO, tl('one', 'two'), tl('one', 'two', 'x')]
  ] as [TurnIntoTarget, Json, Json][])(
    'joins the list before, as %j',
    (target, before, expected) => {
      expectBlocks(convertBlock([before, p('x')], 'x', target).doc, expected)
    }
  )

  test('joins both neighbors', () => {
    expectBlocks(convertBlock([tl('one'), p('x'), tl('two')], 'x', TODO).doc, tl('one', 'x', 'two'))
  })

  test('joins below the top level', () => {
    expectBlocks(
      convertBlock([ul(li('parent', tl('one'), p('x')))], 'x', TODO).doc,
      ul(li('parent', tl('one', 'x')))
    )
  })

  test('the earlier start number wins', () => {
    const started = {...ol('one'), attrs: {start: 5}}
    const joined = convertBlock([started, p('x'), ol('two')], 'x', NUMBERED).doc
    expect(joined.child(1).attrs.start).toBe(5)
    expect(joined.child(1).childCount).toBe(3)
  })

  test('a different list type does not join', () => {
    expectBlocks(convertBlock([ul('one'), p('x')], 'x', NUMBERED).doc, ul('one'), ol('x'))
  })

  test('a split-off tail keeps the start number when nothing joins it', () => {
    const started = {...ol('one', 'two', 'three'), attrs: {start: 5}}
    const {doc} = convertBlock([started], 'two', TEXT, 'listItem')
    expect(doc.child(1).attrs.start).toBe(5)
    expect(doc.child(3).attrs.start).toBe(5)
  })
})

describe('quotes', () => {
  const twoLines = quote(p('l1'), p('l2'))
  test.each([
    [TEXT, [p('l1'), p('l2')]],
    [H2, [h(2, 'l1'), p('l2')]],
    [CODE, [code('l1'), p('l2')]],
    [BULLET, [ul(li('l1', p('l2')))]],
    [DETAILS, [details('l1', p('l2'))]]
  ] as [TurnIntoTarget, Json[]][])(
    'a quote becomes a first line and a body, as %j',
    (target, expected) => {
      expectBlocks(convertBlock([twoLines], 'l1', target, 'blockquote').doc, ...expected)
    }
  )

  test('a heading first child gives its text', () => {
    expectBlocks(
      convertBlock([quote(h(2, 'l1'), p('l2'))], 'l1', TEXT, 'blockquote').doc,
      p('l1'),
      p('l2')
    )
  })

  test('a code first child follows the code rules', () => {
    expectBlocks(
      convertBlock([quote(code('c1\nc2\n'), p('l2'))], 'c1', TEXT, 'blockquote').doc,
      p([text('c1'), hardBreak, text('c2')]),
      p('l2')
    )
  })

  test('a list body stays a list', () => {
    expectBlocks(
      convertBlock([quote(p('l1'), ul('a', 'b'))], 'l1', TEXT, 'blockquote').doc,
      p('l1'),
      ul('a', 'b')
    )
  })
})

describe('details', () => {
  test('a lone empty paragraph is not a body', () => {
    expectBlocks(convertBlock([details('sum')], 'sum', TEXT, 'details').doc, p('sum'))
  })

  test('an empty first line with more after it is a body', () => {
    expectBlocks(
      convertBlock([details('sum', p(), p('x'))], 'sum', TEXT, 'details').doc,
      p('sum'),
      p(),
      p('x')
    )
  })

  test('a lone paragraph holding only a mention is a body', () => {
    const body = p([mention('Sam')])
    expectBlocks(convertBlock([details('sum', body)], 'sum', TEXT, 'details').doc, p('sum'), body)
  })

  test('content follows the summary', () => {
    const block = details('sum', p('x'), image)
    expectBlocks(convertBlock([block], 'sum', TEXT, 'details').doc, p('sum'), p('x'), image)
    expectBlocks(convertBlock([block], 'sum', BULLET, 'details').doc, ul(li('sum', p('x'), image)))
    expectBlocks(convertBlock([block], 'sum', CODE, 'details').doc, code('sum'), p('x'), image)
    expectBlocks(convertBlock([block], 'sum', QUOTE, 'details').doc, quote(p('sum'), p('x'), image))
  })

  test('text becomes the summary of an open block', () => {
    const {doc} = convertBlock([p('x')], 'x', DETAILS)
    expectBlocks(doc, details('x'))
    expect(doc.child(1).attrs.open).toBe(true)
  })

  test('a child of details content converts in place', () => {
    expectBlocks(convertBlock([details('sum', p('x'))], 'x', BULLET).doc, details('sum', ul('x')))
  })
})

describe('text fidelity', () => {
  const rich = p([
    text('Ask', ['bold']),
    text(' '),
    mention('Sam'),
    text(' '),
    text('the spec', ['italic']),
    hardBreak,
    text('next')
  ])

  test('headings and lists keep everything', () => {
    const original = makeDoc(rich).child(1).content.toJSON()
    expect(convertBlock([rich], 'Ask', H2).doc.child(1).content.toJSON()).toEqual(original)
    const list = convertBlock([rich], 'Ask', BULLET).doc
    expect(list.child(1).firstChild?.firstChild?.content.toJSON()).toEqual(original)
  })

  test('code keeps the words and the name', () => {
    expectBlocks(convertBlock([rich], 'Ask', CODE).doc, code('Ask Sam the spec\nnext'))
  })

  test('a summary keeps marks and flattens the rest', () => {
    const summary = convertBlock([rich], 'Ask', DETAILS).doc.child(1).firstChild
    expect(summary?.content.toJSON()).toEqual([
      text('Ask', ['bold']),
      text(' Sam '),
      text('the spec', ['italic']),
      text(' next')
    ])
  })

  test('a mention or line break first in a block does not throw', () => {
    const state = makeState(p([mention('Sam'), text(' pricing')]))
    const heading = convert(state, FIRST_BLOCK_POS, H2).doc.child(1)
    expect(heading.firstChild?.type.name).toBe('pageUserMention')
    expectBlocks(convert(state, FIRST_BLOCK_POS, CODE).doc, code('Sam pricing'))
    expectBlocks(convert(state, FIRST_BLOCK_POS, DETAILS).doc, details('Sam pricing'))
    const broken = makeState(p([hardBreak, text('x')]))
    expect(convert(broken, FIRST_BLOCK_POS, H2).doc.child(1).firstChild?.type.name).toBe(
      'hardBreak'
    )
  })

  test('code loses its outer new lines and turns the rest into breaks', () => {
    expectBlocks(
      convertBlock([code('\na\nb\n')], '\na', TEXT, 'codeBlock').doc,
      p([text('a'), hardBreak, text('b')])
    )
  })

  test('code with only new lines becomes an empty block', () => {
    expectBlocks(convertBlock([code('\n')], '\n', TEXT, 'codeBlock').doc, p())
  })

  test('a line break in code becomes a space in a summary', () => {
    expectBlocks(convertBlock([code('a\nb')], 'a', DETAILS, 'codeBlock').doc, details('a b'))
  })

  test('a heading level change is the only difference', () => {
    expectBlocks(convertBlock([h(2, 'x')], 'x', H3, 'heading').doc, h(3, 'x'))
  })

  test('a heading or code becomes a paragraph inside a quote', () => {
    expectBlocks(convertBlock([h(2, 'x')], 'x', QUOTE, 'heading').doc, quote(p('x')))
    expectBlocks(convertBlock([code('x')], 'x', QUOTE, 'codeBlock').doc, quote(p('x')))
  })
})

describe('page target', () => {
  test('text becomes a new page link titled with its text', () => {
    expectBlocks(
      convertBlock([p('Runbook'), p('after')], 'Runbook', PAGE).doc,
      pageLink(-1, 'Runbook'),
      p('after')
    )
  })

  test('a heading works too', () => {
    expectBlocks(
      convertBlock([h(2, 'Runbook'), p('after')], 'Runbook', PAGE, 'heading').doc,
      pageLink(-1, 'Runbook'),
      p('after')
    )
  })

  test('the title is flat text', () => {
    const {doc} = convertBlock(
      [p([text('Ask', ['bold']), text(' '), mention('Sam'), hardBreak, text('now')])],
      'Ask',
      PAGE
    )
    expect(doc.child(1).attrs.title).toBe('Ask Sam now')
  })

  test('an empty block gets an empty title', () => {
    const state = makeState(p(), p('after'))
    expect(convert(state, FIRST_BLOCK_POS, PAGE).doc.child(1).attrs.title).toBe('')
  })

  test('it stays in its container', () => {
    expectBlocks(
      convertBlock([details('sum', p('Runbook'))], 'Runbook', PAGE).doc,
      details('sum', pageLink(-1, 'Runbook'))
    )
  })

  test.each([
    ['listItem', ul('x')],
    ['blockquote', quote(p('x'))],
    ['details', details('x')],
    ['codeBlock', code('x')]
  ] as [string, Json][])('is refused for %s', (type, block) => {
    const state = makeState(block)
    expect(turnBlockInto(state, findPos(state.doc, 'x', type), PAGE)).toBeNull()
  })
})

describe('what cannot convert', () => {
  test('the page title', () => {
    const state = makeState(p('x'))
    expect(getTurnIntoTarget(state.doc, 0)).toBeNull()
    for (const target of ALL_TARGETS) expect(turnBlockInto(state, 0, target)).toBeNull()
  })

  test('the current type', () => {
    const cases: [Json, string, string, TurnIntoTarget][] = [
      [p('x'), 'x', 'paragraph', TEXT],
      [h(2, 'x'), 'x', 'heading', H2],
      [ul('x'), 'x', 'listItem', BULLET],
      [ol('x'), 'x', 'listItem', NUMBERED],
      [tl('x'), 'x', 'taskItem', TODO],
      [quote(p('x')), 'x', 'blockquote', QUOTE],
      [details('x'), 'x', 'details', DETAILS],
      [code('x'), 'x', 'codeBlock', CODE]
    ]
    for (const [block, label, type, target] of cases) {
      const state = makeState(block)
      expect(turnBlockInto(state, findPos(state.doc, label, type), target)).toBeNull()
    }
  })

  test('a position past the end of the doc', () => {
    const state = makeState(p('x'))
    expect(getTurnIntoTarget(state.doc, state.doc.content.size + 5)).toBeNull()
    expect(turnBlockInto(state, state.doc.content.size + 5, H2)).toBeNull()
  })

  test.each([
    ['image', [image], 'imageBlock'],
    ['divider', [{type: 'horizontalRule'}], 'horizontalRule'],
    ['page link', [pageLink(7, 'x')], 'pageLinkBlock'],
    ['table', [table(p('x'))], 'table'],
    ['whole list', [ul('x')], 'bulletList'],
    ['quote starting with a list', [quote(ul('x'), p('y'))], 'blockquote'],
    ['quote starting with an image', [quote(image, p('x'))], 'blockquote'],
    ['paragraph in a table cell', [table(p('x'))], 'paragraph'],
    ['list item in a table cell', [table(ul('x'))], 'listItem']
  ] as [string, Json[], string][])('%s', (_name, blocks, type) => {
    const state = makeState(...blocks)
    const pos = findPos(state.doc, '', type)
    expect(getTurnIntoTarget(state.doc, pos)).toBeNull()
    expect(turnBlockInto(state, pos, H2)).toBeNull()
  })

  test('the current type is reported for a block', () => {
    const cases: [Json, string, string, TurnIntoTarget][] = [
      [p('x'), 'x', 'paragraph', TEXT],
      [h(4, 'x'), 'x', 'heading', {type: 'heading', level: 4}],
      [ol('x'), 'x', 'listItem', NUMBERED],
      [tl('x'), 'x', 'taskItem', TODO],
      [quote(h(2, 'x')), 'x', 'blockquote', QUOTE],
      [quote(code('x')), 'x', 'blockquote', QUOTE],
      [details('x'), 'x', 'details', DETAILS],
      [code('x'), 'x', 'codeBlock', CODE]
    ]
    for (const [block, label, type, target] of cases) {
      const {doc} = makeState(block)
      expect(getTurnIntoTarget(doc, findPos(doc, label, type))).toEqual(target)
    }
  })
})

describe('the block a text selection turns', () => {
  const findText = (doc: Node, label: string) => {
    let found = -1
    doc.descendants((node, pos) => {
      if (found === -1 && node.isText && node.text?.includes(label)) {
        found = pos + node.text.indexOf(label)
      }
    })
    if (found === -1) throw new Error(`No text ${label}`)
    return found
  }
  const selectText = (blocks: Json[], label: string, toLabel = label) => {
    const state = makeState(...blocks)
    const from = findText(state.doc, label)
    const to = findText(state.doc, toLabel) + toLabel.length
    return state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to)))
  }

  test.each([
    ['a paragraph', [p('one'), p('word')], 'word', 'paragraph', 'word'],
    ['a heading', [h(3, 'word')], 'word', 'heading', 'word'],
    ['a code block', [code('word')], 'word', 'codeBlock', 'word'],
    ['a list item by its first line', [ul('one', 'word')], 'word', 'listItem', 'word'],
    ['a to-do by its first line', [tl('word')], 'word', 'taskItem', 'word'],
    [
      'the innermost item of a nested list',
      [ul(li('one', ul('word')))],
      'word',
      'listItem',
      'word'
    ],
    [
      'a later line of a list item on its own',
      [ul(li('one', p('word')))],
      'word',
      'paragraph',
      'word'
    ],
    ['a whole quote from any line', [quote(p('one'), p('word'))], 'word', 'blockquote', 'one'],
    [
      'a whole quote from a list inside it',
      [quote(p('one'), ul('word'))],
      'word',
      'blockquote',
      'one'
    ],
    ['details by their summary', [details('word', p('body'))], 'word', 'details', 'word'],
    ['a line inside details on its own', [details('one', p('word'))], 'word', 'paragraph', 'word']
  ] as [string, Json[], string, string, string][])(
    '%s',
    (_name, blocks, label, type, blockStart) => {
      const state = selectText(blocks, label)
      expect(getSelectionTurnIntoPos(state)).toBe(findPos(state.doc, blockStart, type))
    }
  )

  test.each([
    ['spans two blocks', [p('one'), p('two')], 'one', 'two'],
    ['spans two list items', [ul('one', 'two')], 'one', 'two'],
    ['is in the page title', [p('one')], 'Title', 'Title'],
    ['is in a table cell', [table(p('word'))], 'word', 'word'],
    ['is in a quote that starts with a list', [quote(ul('word'))], 'word', 'word']
  ] as [string, Json[], string, string][])(
    'nothing when the selection %s',
    (_name, blocks, from, to) => {
      expect(getSelectionTurnIntoPos(selectText(blocks, from, to))).toBeNull()
    }
  )

  test('the picked block converts', () => {
    const state = selectText([ul('one', 'word', 'three')], 'word')
    const tr = convert(state, getSelectionTurnIntoPos(state)!, H2)
    expectBlocks(tr.doc, ul('one'), h(2, 'word'), ul('three'))
  })
})

describe('every source to every target', () => {
  const expectConversion = (state: EditorState, pos: number, target: TurnIntoTarget) => {
    const current = getTurnIntoTarget(state.doc, pos)
    if (!current) throw new Error(`Nothing to convert at ${pos}`)
    const tr = turnBlockInto(state, pos, target)
    const isCurrentType = current.type === target.type && current.level === target.level
    if (isCurrentType || (target.type === 'pageLinkBlock' && !canTurnIntoPage(current))) {
      expect(tr).toBeNull()
      return null
    }
    if (!tr) throw new Error(`Expected a transaction for ${target.type}`)
    tr.doc.check()
    expect(tr.selection).toBeInstanceOf(TextSelection)
    if (target.type !== 'pageLinkBlock') {
      const {$from} = tr.selection
      const ancestors = Array.from({length: $from.depth}, (_, index) => $from.node(index + 1))
      const isInTarget = ({type, attrs}: Node) =>
        type.name === target.type && attrs.level === target.level
      expect(ancestors.some(isInTarget)).toBe(true)
    }
    return tr
  }

  const link = pageLink(7, 'Child')
  const longBody = [p('one'), link, image, pageLink(8, 'Second'), p('two')]
  const sources: [string, Json, string, string][] = [
    ['text', p('word'), 'word', 'paragraph'],
    ['heading', h(2, 'word'), 'word', 'heading'],
    ['deep heading', h(5, 'word'), 'word', 'heading'],
    ['code', code('word\nmore'), 'word', 'codeBlock'],
    ['bullet', ul('word', 'other'), 'word', 'listItem'],
    ['numbered', ol('other', 'word'), 'word', 'listItem'],
    ['to-do', tl('other', 'word', 'tail'), 'word', 'taskItem'],
    ['item with a nested list', ul(li('word', ul('nested'))), 'word', 'listItem'],
    ['to-do with a nested to-do', tl(ti('word', tl('nested'))), 'word', 'taskItem'],
    ['item with a link', ul(li('word', link)), 'word', 'listItem'],
    ['item with a long body', ul(li('word', ...longBody)), 'word', 'listItem'],
    ['quote', quote(p('word'), p('more')), 'word', 'blockquote'],
    ['quote with a link', quote(p('word'), link), 'word', 'blockquote'],
    ['quote with a long body', quote(p('word'), ...longBody), 'word', 'blockquote'],
    ['details', details('word', p('more')), 'word', 'details'],
    ['details with a link', details('word', link), 'word', 'details'],
    ['details with a long body', details('word', ...longBody), 'word', 'details'],
    ['text in details', details('sum', p('word')), 'word', 'paragraph'],
    ['item in details', details('sum', ul('word', 'other')), 'word', 'listItem'],
    ['item in a quote', quote(p('intro'), ul('word', 'other')), 'word', 'listItem']
  ]
  const countLinks = (doc: Node) => {
    let count = 0
    doc.descendants((node) => {
      if (node.type.name === 'pageLinkBlock' && node.attrs.pageCode === 7) count++
    })
    return count
  }
  const contentOf = (doc: Node) => {
    const found: string[] = []
    doc.descendants((node) => {
      if (node.isText) found.push(...(node.text ?? '').split(/\s+/).filter(Boolean))
      if (node.type.name === 'pageLinkBlock' && node.attrs.title) found.push(node.attrs.title)
      if (node.type.name === 'imageBlock') found.push(node.attrs.src)
    })
    return found
  }

  for (const [name, block, label, type] of sources) {
    for (const target of ALL_TARGETS) {
      const targetName = target.type + (target.level ?? '')
      test(`${name} to ${targetName}`, () => {
        const state = makeState(block)
        const tr = expectConversion(state, findPos(state.doc, label, type), target)
        if (!tr) return
        expect(contentOf(tr.doc)).toEqual(contentOf(state.doc))
        expect(countLinks(tr.doc)).toBe(countLinks(state.doc))
        expect(tr.steps.length).toBeGreaterThan(0)
      })
    }
  }

  const empties: [string, Json, string][] = [
    ['text', p(), 'paragraph'],
    ['heading', h(2), 'heading'],
    ['code', code(), 'codeBlock'],
    ['bullet', ul(li('')), 'listItem'],
    ['to-do', tl(ti('')), 'taskItem'],
    ['quote', quote(p()), 'blockquote'],
    ['details', details(''), 'details']
  ]
  for (const [name, block, type] of empties) {
    for (const target of ALL_TARGETS) {
      test(`empty ${name} to ${target.type}${target.level ?? ''}`, () => {
        const state = makeState(block, p('after'))
        const tr = expectConversion(state, findPos(state.doc, '', type), target)
        if (!tr || target.type === 'pageLinkBlock') return
        expect(tr.selection.$from.parent.content.size).toBe(0)
        expect(tr.doc.textContent).toBe('Titleafter')
      })
    }
  }
})

describe('sub-pages and images', () => {
  test('a nested link keeps its order among sub-pages', () => {
    const blocks = [ul(li('word', pageLink(1, 'a'), pageLink(2, 'b'))), pageLink(3, 'c')]
    const {doc} = convertBlock(blocks, 'word', TEXT, 'listItem')
    const codes: number[] = []
    doc.descendants((node) => {
      if (node.type.name === 'pageLinkBlock') codes.push(node.attrs.pageCode)
    })
    expect(codes).toEqual([1, 2, 3])
  })

  test('a nested image a collaborator added stays untrusted', () => {
    const state = EditorState.create({
      doc: makeDoc(ul(li('word', image))),
      plugins: [localEmbedSourcesPlugin]
    })
    const pos = findPos(state.doc, 'word', 'listItem')
    state.apply(convert(state, pos, TEXT))
    expect(isLocalEmbedSource(image.attrs.src)).toBe(false)
  })
})

describe('the caret', () => {
  const caretText = (tr: ReturnType<typeof convert>) => {
    expect(tr.selection).toBeInstanceOf(TextSelection)
    const {$from} = tr.selection
    expect($from.parentOffset).toBe($from.parent.content.size)
    return $from.parent.textContent
  }

  test.each([H2, BULLET, TODO, DETAILS, CODE, QUOTE])(
    'lands at the end of the first line, as %j',
    (target) => {
      expect(caretText(convertBlock([p('word'), p('after')], 'word', target))).toBe('word')
    }
  )

  test('lands at the end of a line that became text', () => {
    expect(caretText(convertBlock([h(2, 'word'), p('after')], 'word', TEXT, 'heading'))).toBe(
      'word'
    )
  })

  test('survives a join', () => {
    expect(caretText(convertBlock([tl('one'), p('word'), tl('two')], 'word', TODO))).toBe('word')
  })

  test('lands in the converted item after a split', () => {
    expect(caretText(convertBlock([ul('one', 'two', 'three')], 'two', TEXT, 'listItem'))).toBe(
      'two'
    )
  })

  test('skips to the end of the line after a new page link', () => {
    expect(caretText(convertBlock([p('word'), p('after')], 'word', PAGE))).toBe('after')
  })

  test('gets a line of its own below a page link that ends the doc', () => {
    const state = makeState(p('word'))
    const pos = findPos(state.doc, 'word', 'paragraph')
    const caretInBlock = TextSelection.create(state.doc, pos + 'word'.length + 1)
    const tr = convert(state.apply(state.tr.setSelection(caretInBlock)), pos, PAGE)
    expectBlocks(tr.doc, pageLink(-1, 'word'), p())
    expect(tr.selection).toBeInstanceOf(TextSelection)
    expect(caretText(tr)).toBe('')
  })
})

describe('with the real editor plugins', () => {
  const editor = new Editor({
    extensions: [...pagesExtensions, AutoJoiner],
    content: makeDoc().toJSON()
  })
  const run = (blocks: Json[], label: string, target: TurnIntoTarget, type: string) => {
    const state = EditorState.create({
      doc: Node.fromJSON(editor.schema, makeDoc(...blocks).toJSON()),
      plugins: editor.extensionManager.plugins
    })
    const tr = turnBlockInto(state, findPos(state.doc, label, type), target)
    if (!tr) throw new Error('Expected a transaction')
    const result = state.applyTransaction(tr).state
    result.doc.check()
    return result
  }

  afterAll(() => editor.destroy())

  test('converting the last block adds a trailing paragraph', () => {
    const {doc} = run([p('word')], 'word', H2, 'paragraph')
    expect(doc.lastChild?.type.name).toBe('paragraph')
    expect(doc.lastChild?.content.size).toBe(0)
  })

  test('a page link ending the doc gets one line below it, holding the caret', () => {
    const {doc, selection} = run([p('word')], 'word', PAGE, 'paragraph')
    expect(doc.childCount).toBe(3)
    expect(doc.child(1).type.name).toBe('pageLinkBlock')
    expect(selection.from).toBe(doc.content.size - 1)
  })

  test('joins match with AutoJoiner running', () => {
    const {doc} = run([ol('one'), p('word'), ol('two'), p('tail')], 'word', NUMBERED, 'paragraph')
    expect(doc.child(1).type.name).toBe('orderedList')
    expect(doc.child(1).childCount).toBe(3)
  })

  test('a split is not undone by AutoJoiner', () => {
    const {doc} = run([ul('one', 'two', 'three'), p('tail')], 'two', TEXT, 'listItem')
    expect(doc.childCount).toBe(5)
    expect(doc.child(2).type.name).toBe('paragraph')
  })

  test('a to-do split stays split next to other lists', () => {
    const {doc} = run([tl('one', 'two'), ul('x')], 'two', BULLET, 'taskItem')
    expect(doc.child(1).type.name).toBe('taskList')
    expect(doc.child(2).type.name).toBe('bulletList')
    expect(doc.child(2).childCount).toBe(2)
  })
})
