import {TiptapTransformer} from '@hocuspocus/transformer'
import {generateText} from '@tiptap/core'
import {sql} from 'kysely'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {applyUpdate, Doc} from 'yjs'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../server/postgres/getKysely'
import getModelManager from '../ai_models/ModelManager'
import type {ModelId} from '../ai_models/modelIdDefinitions'
import type {JobQueueStepRun} from '../custom'
import {getTSV, type TSVLanguage} from '../getSupportedLanguages'
import {numberVectorToString} from '../indexing/numberVectorToString'
import {inferLanguage} from '../inferLanguage'
import {JobQueueError} from '../JobQueueError'
import {TipTapChunker} from '../TipTapChunker'

export interface EmbedPageData {
  pageId: number
  modelId: ModelId
}

function weightedTsvector(language: TSVLanguage, title: string, headings: string, body: string) {
  return sql`
    setweight(to_tsvector(${language}, ${title}), 'A') ||
    setweight(to_tsvector(${language}, ${headings}), 'B') ||
    setweight(to_tsvector(${language}, ${body}), 'D')
  `
}
export const embedPage: JobQueueStepRun<EmbedPageData> = async (context) => {
  const {data} = context
  const {modelId, pageId} = data
  const modelManager = getModelManager()

  const embeddingModel = modelManager.getEmbedder(modelId)
  if (!embeddingModel) {
    return new JobQueueError(`embedding model ${modelId} not available`)
  }
  const pg = getKysely()
  const [page, existingChunks] = await Promise.all([
    pg.selectFrom('Page').select(['yDoc', 'updatedAt']).where('id', '=', pageId).executeTakeFirst(),
    pg
      .selectFrom(embeddingModel.pagesTableName)
      .select(['chunkNumber', 'embedText', 'pageUpdatedAt'])
      .where('pageId', '=', pageId)
      .orderBy('chunkNumber', 'asc')
      .execute()
  ])

  if (!page || !page.yDoc) {
    return new JobQueueError(`pageId ${pageId} was deleted`)
  }

  const firstExistingChunk = existingChunks[0]
  if (firstExistingChunk && firstExistingChunk.pageUpdatedAt === page.updatedAt) {
    return new JobQueueError(`pageId ${pageId} embedding is already current`)
  }

  const yDoc = new Doc()
  applyUpdate(yDoc, page.yDoc)
  const content = TiptapTransformer.fromYdoc(yDoc, 'default') as TipTapSerializedContent
  const fullText = generateText(content, serverTipTapExtensions)
  const language = inferLanguage(fullText, 5)
  const tsvLanguage = getTSV(language)

  if (!language || !tsvLanguage || !embeddingModel.languages.includes(language)) {
    return new JobQueueError(`pageId ${pageId} is written in unsupported language: ${language}`)
  }
  const chunker = new TipTapChunker({language})
  const chunks = chunker.chunk(content)
  const updatedChunks = chunks.filter((chunk, idx) => {
    const oldEmbeding = existingChunks[idx]
    const isIdentical = oldEmbeding?.embedText === chunk.text
    return !isIdentical
  })
  const errors = await Promise.all(
    updatedChunks.map(async (chunk, chunkNumber) => {
      const {text, globalTitle, headingPath, embeddingText} = chunk
      const embeddingVector = await embeddingModel.getEmbedding(embeddingText)
      if (embeddingVector instanceof Error) {
        return new JobQueueError(
          `unable to get embeddings from ${modelId}: ${embeddingVector.message}`
        )
      }
      try {
        await pg
          .insertInto(embeddingModel.pagesTableName)
          .columns(['embedText', 'tsv', 'embedding', 'pageId', 'chunkNumber', 'pageUpdatedAt'])
          .expression((eb) =>
            eb
              // to avoid passing in chunk twice, we pass it in here, and reference it as val twice below
              .selectFrom(sql`(SELECT ${text}::text as val)`.as('input'))
              .select([
                sql<string>`val`.as('val'),
                weightedTsvector(tsvLanguage, globalTitle, headingPath.join(' '), text).as('tsv'),
                sql<string>`${numberVectorToString(embeddingVector)}`.as('embedding'),
                sql<number>`${pageId}`.as('pageId'),
                sql<number>`${chunkNumber}`.as('chunkNumber'),
                // This acts as a version # so we can make sure the embedding is for the most recent page
                // In the future, if we want to do historical imports where we don't update the model, we can use this, too
                // For now, updating the model will re-embed all pages, which suffices
                sql<number>`${page.updatedAt}`.as('pageUpdatedAt')
              ])
          )
          .onConflict((oc) =>
            oc.columns(['pageId', 'chunkNumber']).doUpdateSet((eb) => ({
              embedText: eb.ref('excluded.embedText'),
              tsv: eb.ref('excluded.tsv'),
              embedding: eb.ref('excluded.embedding'),
              pageUpdatedAt: eb.ref('excluded.pageUpdatedAt')
            }))
          )
          .execute()
      } catch (e) {
        return new JobQueueError(e as Error)
      }
      return undefined
    })
  )
  const firstError = errors.find((error) => error instanceof JobQueueError)
  const existingChunkCount = existingChunks?.length ?? 0
  const deleteOldChunks = chunks.length < existingChunkCount && !firstError
  if (deleteOldChunks) {
    await pg
      .deleteFrom(embeddingModel.pagesTableName)
      .where('pageId', '=', pageId)
      .where('chunkNumber', '>', chunks.length - 1)
      .execute()
  }
  return firstError || data
}
