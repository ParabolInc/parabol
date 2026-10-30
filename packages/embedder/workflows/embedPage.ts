import {TiptapTransformer} from '@hocuspocus/transformer'
import {generateText} from '@tiptap/core'
import {sql} from 'kysely'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {applyUpdate, Doc} from 'yjs'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../server/postgres/getKysely'
import {Logger} from '../../server/utils/Logger'
import getModelManager from '../ai_models/ModelManager'
import type {ModelId} from '../ai_models/modelIdDefinitions'
import type {JobQueueStepRun} from '../custom'
import {getTSV, type TSVLanguage} from '../getSupportedLanguages'
import {numberVectorToString} from '../indexing/numberVectorToString'
import {inferLanguage} from '../inferLanguage'
import {JobQueueError} from '../JobQueueError'
import {MarkdownChunker} from '../MarkdownChunker'
import {planChunkReuse} from '../planChunkReuse'
import {TipTapChunker} from '../TipTapChunker'

export interface EmbedPageData {
  pageId: number
  modelId: ModelId
}

interface PageChunk {
  text: string
  globalTitle: string
  headingPath: string[]
  embeddingText: string
}

const UNSTAMPED_PAGE_UPDATED_AT = new Date(0)

function weightedTsvector(
  language: TSVLanguage | 'simple',
  title: string,
  headings: string,
  body: string
) {
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
      .select(['id', 'chunkNumber', 'embedText', 'pageUpdatedAt'])
      .where('pageId', '=', pageId)
      .orderBy('chunkNumber', 'asc')
      .execute()
  ])

  if (!page) {
    return new JobQueueError(`pageId ${pageId} was deleted`)
  }
  if (!page.yDoc) {
    return new JobQueueError(`pageId ${pageId} has no yDoc`)
  }

  const isCurrent =
    existingChunks.length > 0 &&
    existingChunks.every(({pageUpdatedAt}) => pageUpdatedAt.getTime() === page.updatedAt.getTime())
  if (isCurrent) return false

  const yDoc = new Doc()
  applyUpdate(yDoc, page.yDoc)
  const content = TiptapTransformer.fromYdoc(yDoc, 'default') as TipTapSerializedContent
  let fullText = ''
  try {
    fullText = generateText(content, serverTipTapExtensions)
  } catch {}
  const language = inferLanguage(fullText, 5)
  const tsvLanguage = getTSV(language) ?? 'simple'
  const chunker =
    embeddingModel.chunker === 'markdown'
      ? new MarkdownChunker({language})
      : new TipTapChunker({language})
  const chunks: PageChunk[] = chunker.chunk(content)
  const {deleteIds, toEmbed} = planChunkReuse(
    existingChunks,
    chunks.map(({embeddingText}) => embeddingText)
  )
  const startedAt = Date.now()
  let tokens = 0
  for (const {chunkIndex, chunkNumber} of toEmbed) {
    const {text, globalTitle, headingPath, embeddingText} = chunks[chunkIndex]!
    const embedded = await embeddingModel.getEmbeddingWithTokens(embeddingText)
    if (embedded instanceof Error) {
      return new JobQueueError(`unable to get embeddings from ${modelId}: ${embedded.message}`)
    }
    const embeddingVector = embedded.embedding
    tokens += embedded.tokens
    try {
      await pg
        .insertInto(embeddingModel.pagesTableName)
        .columns(['embedText', 'tsv', 'embedding', 'pageId', 'chunkNumber', 'pageUpdatedAt'])
        .expression((eb) =>
          eb
            .selectFrom(sql`(SELECT ${embeddingText}::text as val)`.as('input'))
            .select([
              sql<string>`val`.as('val'),
              weightedTsvector(tsvLanguage, globalTitle, headingPath.join(' '), text).as('tsv'),
              sql<string>`${numberVectorToString(embeddingVector)}`.as('embedding'),
              sql<number>`${pageId}`.as('pageId'),
              sql<number>`${chunkNumber}`.as('chunkNumber'),
              sql<Date>`${UNSTAMPED_PAGE_UPDATED_AT}`.as('pageUpdatedAt')
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
  }
  if (deleteIds.length > 0) {
    await pg.deleteFrom(embeddingModel.pagesTableName).where('id', 'in', deleteIds).execute()
  }
  await pg
    .updateTable(embeddingModel.pagesTableName)
    .set({pageUpdatedAt: page.updatedAt})
    .where('pageId', '=', pageId)
    .where('pageUpdatedAt', '<>', page.updatedAt)
    .execute()
  Logger.log(
    `embedPage ${pageId}: embedded ${toEmbed.length} of ${chunks.length} chunks, ${tokens} tokens, ${Date.now() - startedAt} ms`
  )
  return data
}
