import {TiptapTransformer} from '@hocuspocus/transformer'
import {generateText, type JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import ms from 'ms'
import {applyUpdate, Doc} from 'yjs'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../server/postgres/getKysely'
import getModelManager from '../ai_models/ModelManager'
import type {ModelId} from '../ai_models/modelIdDefinitions'
import type {JobQueueStepRun} from '../custom'
import {getTSV} from '../getSupportedLanguages'
import {numberVectorToString} from '../indexing/numberVectorToString'
import {inferLanguage} from '../inferLanguage'
import {JobQueueError} from '../JobQueueError'

export interface EmbedPageData {
  pageId: number
  modelId: ModelId
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
  const page = await pg
    .selectFrom('Page')
    .select('yDoc')
    .where('id', '=', pageId)
    .executeTakeFirst()
  if (!page || !page.yDoc) {
    return new JobQueueError(`pageId ${pageId} was deleted`)
  }

  const yDoc = new Doc()
  applyUpdate(yDoc, page.yDoc)
  const content = TiptapTransformer.fromYdoc(yDoc, 'default') as JSONContent
  const fullText = generateText(content, serverTipTapExtensions)
  const language = inferLanguage(fullText, 5)
  const tsvLanguage = getTSV(language)
  // Exit successfully, we don't want to fail the job because the language is not supported
  if (!language || !tsvLanguage || !embeddingModel.languages.includes(language)) return false

  const chunks = await embeddingModel.chunkText(fullText)
  if (chunks instanceof Error) {
    return new JobQueueError(`unable to get tokens: ${chunks.message}`, ms('1m'), 2)
  }

  const errors = await Promise.all(
    chunks.map(async (chunk, chunkNumber) => {
      const embeddingVector = await embeddingModel.getEmbedding(chunk)
      if (embeddingVector instanceof Error) {
        return new JobQueueError(
          `unable to get embeddings: ${embeddingVector.message}`,
          ms('1m'),
          10
        )
      }
      await pg
        .insertInto(embeddingModel.pagesTableName)
        .columns(['embedText', 'tsv', 'embedding', 'pageId', 'chunkNumber'])
        .expression((eb) =>
          eb
            // to avoid passing in chunk twice, we pass it in here, and reference it as val twice below
            .selectFrom(sql`(SELECT ${chunk}::text as val)`.as('input'))
            .select([
              sql<string>`val`.as('val'),
              sql<string>`to_tsvector('${sql.raw(tsvLanguage)}', val)`.as('tsv'),
              sql<string>`${numberVectorToString(embeddingVector)}`.as('embedding'),
              sql<number>`${pageId}`.as('pageId'),
              sql<number>`${chunkNumber}`.as('chunkNumber')
            ])
        )
        .onConflict((oc) =>
          oc.columns(['pageId', 'chunkNumber']).doUpdateSet((eb) => ({
            embedText: eb.ref('excluded.embedText'),
            embedding: eb.ref('excluded.embedding')
          }))
        )
        .execute()
      return undefined
    })
  )
  const firstError = errors.find((error) => error instanceof JobQueueError)
  return firstError || data
}
