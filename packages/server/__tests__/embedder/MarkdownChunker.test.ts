import {createHash} from 'crypto'
import type {TipTapSerializedContent} from '../../../client/shared/tiptap/TipTapSerializedContent'
import {MarkdownChunker} from '../../../embedder/MarkdownChunker'
import generateHeavyCorpus from '../../__evals__/pagesSearch/heavyCorpus/generateHeavyCorpus'

const MASTER_DIGEST = 'a9fd9fd2d984e47611f5998cb36f3ad88eb0f73043b8d6236adc311f296eeb25'

it('chunks pages exactly as the markdown chunker on master did', () => {
  const chunker = new MarkdownChunker({language: 'en'})
  const texts = generateHeavyCorpus().flatMap(({content}) =>
    chunker.chunk(content as TipTapSerializedContent).map(({embeddingText}) => embeddingText)
  )
  expect(texts).toHaveLength(399)
  expect(createHash('sha256').update(texts.join('\u0000')).digest('hex')).toBe(MASTER_DIGEST)
})
