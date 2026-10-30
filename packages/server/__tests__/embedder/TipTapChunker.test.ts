import type {JSONContent} from '@tiptap/core'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {getSearchText} from '../../../embedder/getSearchText'
import {estimateTokens, TipTapChunker} from '../../../embedder/TipTapChunker'
import generateHeavyCorpus from '../../__evals__/pagesSearch/heavyCorpus/generateHeavyCorpus'
import {
  bulletList,
  heading,
  paragraph,
  table
} from '../../__evals__/pagesSearch/heavyCorpus/tiptapNodes'

const chunk = (content: JSONContent[]) =>
  new TipTapChunker({language: 'en'}).chunk({type: 'doc', content} as TipTapSerializedContent)

const embeddedText = (key: string) => {
  const page = generateHeavyCorpus().find((candidate) => candidate.key === key)!
  return new TipTapChunker({language: 'en'})
    .chunk(page.content as TipTapSerializedContent)
    .map(({embeddingText}) => embeddingText)
    .join('\n')
}

const sentence = (topic: string, index: number) =>
  `The ${topic} work item number ${index} moved forward after the review this week.`
const prose = (topic: string, sentences: number) =>
  Array.from({length: sentences}, (_, index) => sentence(topic, index)).join(' ')

it('embeds search text, not markup', () => {
  const embedded = embeddedText('atlas-standup-2026-08-03')
  expect(embedded).toContain('Lukas Becker:')
  expect(embedded).not.toMatch(/:::|avatar=|"type":|https?:\/\//)
})

it('leaves out the standup table that repeats the responses', () => {
  const embedded = embeddedText('atlas-standup-2026-08-03')
  expect(embedded).not.toContain('Author | Created at | Content')
  expect(embedded).toContain('Lukas Becker:')
})

it("keeps a retro's table, which holds its reflections", () =>
  expect(embeddedText('atlas-retro-4')).toContain('Reflection Group | Votes'))

it('counts CJK characters one token each', () => expect(estimateTokens('会議メモ')).toBe(4))

it('counts other text at 3.7 characters a token', () =>
  expect(estimateTokens('a'.repeat(3700))).toBe(1000))

it('starts a section at H1 and H2 but not H3', () => {
  const chunks = chunk([
    heading(1, 'Runbook'),
    heading(2, 'Alpha'),
    paragraph(prose('alpha', 15)),
    heading(3, 'Alpha detail'),
    paragraph('The alpha detail lives here.'),
    heading(2, 'Beta'),
    paragraph(prose('beta', 15))
  ])
  expect(chunks.map(({headingPath}) => headingPath)).toEqual([
    ['Runbook', 'Alpha'],
    ['Runbook', 'Beta']
  ])
  expect(chunks[0]!.text).toContain('Alpha detail\nThe alpha detail lives here.')
})

it('keeps a short page in one chunk', () => {
  const chunks = chunk([
    heading(1, 'Notes'),
    heading(2, 'Alpha'),
    paragraph('Alpha text.'),
    heading(2, 'Beta'),
    paragraph('Beta text.')
  ])
  expect(chunks).toHaveLength(1)
  expect(chunks[0]!.embeddingText).toBe('Notes\n\nAlpha\nAlpha text.\nBeta\nBeta text.')
})

it('reads a heading in full, marks and all', () => {
  const [first] = chunk([
    {
      type: 'heading',
      attrs: {level: 1},
      content: [
        {type: 'text', text: 'Release '},
        {type: 'text', text: 'plan', marks: [{type: 'bold'}]}
      ]
    },
    paragraph('Text.')
  ])
  expect(first!.globalTitle).toBe('Release plan')
})

it('leaves no gap when a heading skips a level', () => {
  const chunks = chunk([
    heading(1, 'Handbook'),
    heading(2, 'Intro'),
    paragraph(prose('intro', 15)),
    heading(1, 'Appendix'),
    heading(3, 'Deep'),
    paragraph(prose('deep', 15))
  ])
  expect(chunks.at(-1)!.headingPath).toEqual(['Appendix'])
  expect(chunks.at(-1)!.embeddingText.startsWith('Handbook > Appendix\n\n')).toBe(true)
})

it('writes the title and section path as the header', () => {
  const chunks = chunk([
    heading(1, 'Runbook'),
    heading(2, 'Alpha'),
    paragraph(prose('alpha', 15)),
    heading(2, 'Beta'),
    paragraph(prose('beta', 15))
  ])
  expect(chunks[1]!.embeddingText.startsWith('Runbook > Beta\n\n')).toBe(true)
})

it('makes no chunk for a section without text', () => {
  const chunks = chunk([
    heading(1, 'Runbook'),
    heading(2, 'Empty'),
    heading(2, 'Alpha'),
    paragraph(prose('alpha', 15)),
    heading(2, 'Beta'),
    paragraph(prose('beta', 15))
  ])
  expect(chunks.map(({headingPath}) => headingPath.at(-1))).toEqual(['Alpha', 'Beta'])
})

it('makes no chunks for a page without text', () =>
  expect(chunk([heading(1, 'Q4 planning (draft)')])).toEqual([]))

it('splits a long table into row groups that repeat the header', () => {
  const rows = Array.from({length: 60}, (_, index) => [
    `Story ${index}`,
    `${index} points`,
    prose('row', 1)
  ])
  const chunks = chunk([heading(1, 'Estimates'), table(['Story', 'Points', 'Notes'], rows)])
  expect(chunks.length).toBeGreaterThan(1)
  for (const {text, embeddingText} of chunks) {
    expect(text.startsWith('Story | Points | Notes\n')).toBe(true)
    expect(estimateTokens(embeddingText)).toBeLessThanOrEqual(512)
  }
  expect(chunks.flatMap(({text}) => text.split('\n').slice(1))).toHaveLength(60)
})

it('splits a long list into item groups', () => {
  const items = Array.from({length: 200}, (_, index) => paragraph(sentence('list', index)))
  const chunks = chunk([heading(1, 'Backlog'), bulletList(items)])
  expect(chunks.length).toBeGreaterThan(1)
  expect(chunks.every(({embeddingText}) => estimateTokens(embeddingText) <= 512)).toBe(true)
  expect(chunks.flatMap(({text}) => text.split('\n'))).toHaveLength(200)
})

it('splits a long paragraph into sentence groups without overlap or loss', () => {
  const text = prose('essay', 300)
  const chunks = chunk([heading(1, 'Essay'), paragraph(text)])
  expect(chunks.length).toBeGreaterThan(1)
  expect(chunks.every(({embeddingText}) => estimateTokens(embeddingText) <= 512)).toBe(true)
  expect(chunks.map(({text: chunkText}) => chunkText).join(' ')).toBe(text)
})

describe('on the heavy corpus', () => {
  const pages = generateHeavyCorpus()
  const words = (text: string) => text.split(/\s+/).filter(Boolean)

  it('keeps every chunk within 512 tokens', () => {
    for (const page of pages) {
      for (const {embeddingText} of new TipTapChunker({language: 'en'}).chunk(
        page.content as TipTapSerializedContent
      )) {
        expect(estimateTokens(embeddingText)).toBeLessThanOrEqual(512)
      }
    }
  })

  it('loses no words of any block', () => {
    for (const page of pages) {
      const content = (page.content.content ?? []).filter(
        ({type}) => type !== 'heading' && type !== 'details'
      )
      const expected = words(content.map(getSearchText).join(' '))
      const chunked = new Set(
        words(
          new TipTapChunker({language: 'en'})
            .chunk(page.content as TipTapSerializedContent)
            .map(({text}) => text)
            .join(' ')
        )
      )
      expect(expected.filter((word) => !chunked.has(word))).toEqual([])
    }
  })
})

it('chunks a page whose title is longer than a chunk', () => {
  const chunks = chunk([heading(1, 'Title '.repeat(600)), paragraph(prose('long title', 40))])
  expect(chunks.length).toBeGreaterThan(0)
  expect(chunks.every(({embeddingText}) => estimateTokens(embeddingText) <= 512)).toBe(true)
})

it('chunks a table whose header row is longer than a chunk', () => {
  const header = ['Column '.repeat(400), 'Notes']
  const rows = Array.from({length: 50}, (_, index) => [`Row ${index}`, prose('cell', 1)])
  const chunks = chunk([heading(1, 'Wide table'), table(header, rows)])
  expect(chunks.length).toBeGreaterThan(0)
  expect(chunks.every(({embeddingText}) => estimateTokens(embeddingText) <= 512)).toBe(true)
})
