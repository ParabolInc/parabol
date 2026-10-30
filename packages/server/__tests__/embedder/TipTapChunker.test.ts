import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {TipTapChunker} from '../../../embedder/TipTapChunker'
import generateHeavyCorpus from '../../__evals__/pagesSearch/heavyCorpus/generateHeavyCorpus'

const embeddedText = (key: string) => {
  const page = generateHeavyCorpus().find((candidate) => candidate.key === key)!
  return new TipTapChunker({language: 'en'})
    .chunk(page.content as TipTapSerializedContent)
    .map(({embeddingText}) => embeddingText)
    .join('\n')
}

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
