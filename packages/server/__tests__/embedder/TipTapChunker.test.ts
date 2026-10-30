import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {TipTapChunker} from '../../../embedder/TipTapChunker'
import generateHeavyCorpus from '../../__evals__/pagesSearch/heavyCorpus/generateHeavyCorpus'

it('embeds search text, not markup', () => {
  const page = generateHeavyCorpus().find(({key}) => key === 'atlas-standup-2026-08-03')!
  const chunks = new TipTapChunker({language: 'en'}).chunk(page.content as TipTapSerializedContent)
  const embedded = chunks.map(({embeddingText}) => embeddingText).join('\n')
  expect(embedded).toContain('Lukas Becker:')
  expect(embedded).not.toMatch(/:::|avatar=|"type":|https?:\/\//)
})
