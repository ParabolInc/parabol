import {getSchema} from '@tiptap/core'
import {getTableOfContentsItems} from '../getTableOfContentsItems'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)
const heading = (level: number, text: string) => ({
  type: 'heading',
  attrs: {level},
  content: text ? [{type: 'text', text}] : []
})
const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const makeDoc = (...content: object[]) =>
  schema.nodeFromJSON({type: 'doc', content: [heading(1, 'Page title'), ...content]})

describe('getTableOfContentsItems', () => {
  it('excludes the page title and returns body headings with positions', () => {
    const doc = makeDoc(paragraph('intro'), heading(2, 'Overview'), heading(3, 'Goals'))
    const items = getTableOfContentsItems(doc)
    expect(items.map(({text, level}) => ({text, level}))).toEqual([
      {text: 'Overview', level: 2},
      {text: 'Goals', level: 3}
    ])
    items.forEach(({pos}) => expect(doc.nodeAt(pos)?.type.name).toBe('heading'))
  })

  it('normalizes depth to the shallowest level present', () => {
    const doc = makeDoc(heading(2, 'A'), heading(3, 'B'), heading(2, 'C'))
    expect(getTableOfContentsItems(doc).map(({depth}) => depth)).toEqual([0, 1, 0])
  })

  it('keeps H1 in the body at depth 0 and pushes H2/H3 under it', () => {
    const doc = makeDoc(heading(1, 'A'), heading(2, 'B'), heading(3, 'C'))
    expect(getTableOfContentsItems(doc).map(({depth}) => depth)).toEqual([0, 1, 2])
  })

  it('skips empty headings and headings deeper than level 3', () => {
    const doc = makeDoc(heading(2, ''), heading(4, 'Too deep'), heading(2, 'Kept'))
    expect(getTableOfContentsItems(doc).map(({text}) => text)).toEqual(['Kept'])
  })

  it('excludes headings inside table cells and details content', () => {
    const doc = makeDoc(
      {
        type: 'table',
        content: [
          {type: 'tableRow', content: [{type: 'tableCell', content: [heading(2, 'In table')]}]}
        ]
      },
      {
        type: 'details',
        content: [
          {type: 'detailsSummary', content: [{type: 'text', text: 'Toggle'}]},
          {type: 'detailsContent', content: [heading(2, 'In toggle')]}
        ]
      },
      {type: 'blockquote', content: [heading(2, 'In quote')]}
    )
    expect(getTableOfContentsItems(doc).map(({text}) => text)).toEqual(['In quote'])
  })

  it('returns an empty list when only the title exists', () => {
    expect(getTableOfContentsItems(makeDoc(paragraph('just text')))).toEqual([])
  })
})
