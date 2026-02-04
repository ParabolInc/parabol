import {sql} from 'kysely'
import isValid from '../../server/graphql/isValid'
import getKysely from '../../server/postgres/getKysely'
import {Logger} from '../../server/utils/Logger'
import {getEmbedderJobPriority} from '../getEmbedderJobPriority'
import {
  type EmbeddingsPagesTable,
  type EmbeddingsTable,
  getEmbeddingsPagesTableName,
  getEmbeddingsTableName
} from '../getEmbeddingsTableName'
import type {ISO6391} from '../iso6393To1'
import {URLRegex} from '../regex'
import {AbstractModel} from './AbstractModel'
import type {ModelId} from './modelIdDefinitions'

export interface EmbeddingModelParams {
  embeddingDimensions: number
  precision: 32 | 16
  tableSuffix: string
  languages: readonly ISO6391[]
}

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  readonly embeddingDimensions: number
  readonly embeddingPrecision: 32 | 16
  readonly maxInputTokens: number
  readonly tableName: EmbeddingsTable
  readonly pagesTableName: EmbeddingsPagesTable
  readonly languages: readonly ISO6391[]
  readonly modelId: ModelId
  protected isReady = false
  constructor(modelId: ModelId, url: string, maxTokens: number) {
    super(url)
    this.modelId = modelId
    const modelParams = this.constructModelParams(modelId)
    this.embeddingDimensions = modelParams.embeddingDimensions
    this.embeddingPrecision = modelParams.precision
    this.languages = modelParams.languages
    this.maxInputTokens = maxTokens
    this.tableName = getEmbeddingsTableName(modelId)
    this.pagesTableName = getEmbeddingsPagesTableName(modelId)!
  }
  protected abstract constructModelParams(modelId: ModelId): EmbeddingModelParams
  abstract getEmbedding(content: string, retries?: number): Promise<number[] | Error>
  abstract ready(): Promise<boolean>

  abstract getTokens(content: string): Promise<number[] | Error>

  private normalizeContent = (content: string, truncateUrls: boolean) => {
    if (!truncateUrls) return content.trim()
    // pathname & search can include a lot of garbage that doesn't help the meaning
    return content.trim().replaceAll(URLRegex, (match) => new URL(match).origin)
  }

  async chunkText(content: string) {
    const AVG_CHARS_PER_TOKEN = 20
    const maxContentLength = this.maxInputTokens * AVG_CHARS_PER_TOKEN
    const tokens = content.length < maxContentLength ? await this.getTokens(content) : -1
    if (tokens instanceof Error) return tokens
    const isFullTextTooBig = tokens === -1 || tokens.length > this.maxInputTokens
    if (!isFullTextTooBig) return [content]
    const normalizedContent = this.normalizeContent(content, true)
    for (let i = 0; i < 5; i++) {
      const tokensPerWord = (4 + i) / 3
      const chunks = this.splitText(normalizedContent, tokensPerWord)
      const chunkLengths = await Promise.all(
        chunks.map(async (chunk) => {
          const chunkTokens = await this.getTokens(chunk)
          if (chunkTokens instanceof Error) return chunkTokens
          return chunkTokens.length
        })
      )
      const firstError = chunkLengths.find(
        (chunkLength): chunkLength is Error => chunkLength instanceof Error
      )
      if (firstError) return firstError

      const validChunks = chunkLengths.filter(isValid)
      if (validChunks.every((chunkLength) => chunkLength <= this.maxInputTokens)) {
        return chunks
      }
    }
    return new Error(`Text could not be chunked. The tokenizer cannot support this content.`)
  }
  // private because result must still be too long to go into model. Must verify with getTokens
  private splitText(content: string, tokensPerWord = 4 / 3) {
    const WORD_LIMIT = Math.floor(this.maxInputTokens / tokensPerWord)
    // account for junk data with excessively long words
    const charLimit = WORD_LIMIT * 100
    const chunks: string[] = []
    const delimiters = ['\n\n', '\n', '.', ' '] as const
    const countWords = (text: string) => text.trim().split(/\s+/).length
    const splitOnDelimiter = (text: string, delimiter: (typeof delimiters)[number]) => {
      const sections = text.split(delimiter)
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]!
        // account for multiple delimiters in a row
        if (section.length === 0) continue
        const sectionWordCount = countWords(section)
        if (sectionWordCount < WORD_LIMIT && section.length < charLimit) {
          // try to merge this section with the last one
          const previousSection = chunks.at(-1)
          if (previousSection) {
            const combinedChunks = `${previousSection}${delimiter}${section}`
            const mergedWordCount = countWords(combinedChunks)
            if (mergedWordCount < WORD_LIMIT && combinedChunks.length < charLimit) {
              chunks[chunks.length - 1] = combinedChunks
              continue
            }
          }
          chunks.push(section)
        } else {
          const nextDelimiter = delimiters[delimiters.indexOf(delimiter) + 1]!
          splitOnDelimiter(section, nextDelimiter)
        }
      }
    }
    splitOnDelimiter(content, delimiters[0])
    return chunks
  }

  async createEmbeddingsForModel() {
    Logger.log(`Queueing EmbeddingsMetadata, Pages into EmbeddingsJobQueueV2 for ${this.modelId}`)
    const pg = getKysely()
    const priority = await getEmbedderJobPriority('modelUpdate', null, 0)
    await pg
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'modelId'])
      .expression(({selectFrom}) =>
        selectFrom('EmbeddingsMetadata')
          .select(({ref}) => [
            sql.lit('embed:start').as('jobType'),
            sql.lit(priority).as('priority'),
            ref('id').as('embeddingsMetadataId'),
            sql.lit(this.modelId).as('modelId')
          ])
          .where('language', 'in', this.languages)
          .where(({eb, or}) =>
            or([
              // for new models, we only grab a year's worth of data
              eb('refUpdatedAt', '>', sql<Date>`NOW() - INTERVAL '1 year'`),
              // meetingTemplates are small & parabol-provided ones are older than a year
              eb('objectType', '=', 'meetingTemplate')
            ])
          )
      )
      .onConflict((oc) => oc.doNothing())
      .execute()

    // process pages first
    const pagePriority = priority - 1_000
    await pg
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['jobType', 'priority', 'pageId', 'modelId'])
      .expression(({selectFrom}) =>
        selectFrom('Page').select(({ref}) => [
          sql.lit('embedPage:start').as('jobType'),
          sql.lit(pagePriority).as('priority'),
          ref('id').as('pageId'),
          sql.lit(this.modelId).as('modelId')
        ])
      )
      .onConflict((oc) => oc.doNothing())
      .execute()
    Logger.log(`Metadata loaded into JobQueue for new model ${this.modelId}`)
  }
  async createTable() {
    const pg = getKysely()
    const hasTable =
      (
        await sql<number[]>`SELECT 1 FROM ${sql.id('pg_catalog', 'pg_tables')} WHERE ${sql.id(
          'tablename'
        )} = ${this.tableName}`.execute(pg)
      ).rows.length > 0
    if (hasTable) return
    const vectorDimensions = this.embeddingDimensions
    const precision = this.embeddingPrecision
    const vectorType = precision === 16 ? 'halfvec' : 'vector'
    const columnType = `${vectorType}(${vectorDimensions})`
    const indexType = `${vectorType}_cosine_ops`
    Logger.log(
      `ModelManager: creating ${this.tableName}, ${this.pagesTableName} with ${vectorDimensions} dimensions`
    )
    await sql`
      DO $$
        BEGIN
        CREATE TABLE IF NOT EXISTS ${sql.id(this.tableName)} (
          "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          "embedText" TEXT,
          "tsv" tsvector,
          "embedding" ${sql.raw(columnType)},
          "embeddingsMetadataId" INTEGER NOT NULL,
          "chunkNumber" SMALLINT,
          UNIQUE NULLS NOT DISTINCT("embeddingsMetadataId", "chunkNumber"),
          FOREIGN KEY ("embeddingsMetadataId")
            REFERENCES "EmbeddingsMetadata"("id")
            ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.tableName)}_embedding_vector_cosign_ops"
          ON ${sql.id(this.tableName)}
          USING hnsw ("embedding" ${sql.raw(indexType)});
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.tableName)}_tsv"
          ON ${sql.id(this.tableName)}
          USING GIN ("tsv");
        CREATE TABLE IF NOT EXISTS ${sql.id(this.pagesTableName)} (
          "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          "embedText" TEXT NOT NULL,
          "tsv" tsvector NOT NULL,
          "embedding" ${sql.raw(columnType)},
          "pageId" INTEGER NOT NULL,
          "pageUpdatedAt" timestamp with time zone NOT NULL,
          "chunkNumber" SMALLINT,
          UNIQUE NULLS NOT DISTINCT("pageId", "chunkNumber"),
          FOREIGN KEY ("pageId")
            REFERENCES "Page"("id")
            ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.pagesTableName)}_embedding_vector_cosign_ops"
          ON ${sql.id(this.pagesTableName)}
          USING hnsw ("embedding" ${sql.raw(indexType)});
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.pagesTableName)}_tsv"
          ON ${sql.id(this.pagesTableName)}
          USING GIN ("tsv");
        END
      $$;
      `.execute(pg)
    await this.createEmbeddingsForModel()
  }
}
