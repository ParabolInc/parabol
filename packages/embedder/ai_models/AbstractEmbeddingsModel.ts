import {type Kysely, sql} from 'kysely'
import isValid from '../../server/graphql/isValid'
import getKysely from '../../server/postgres/getKysely'
import {VECTOR_MIN_PAGE_BYTES} from '../../server/postgres/queries/getPagesByRRF'
import type {DB} from '../../server/postgres/types/pg'
import getRedis from '../../server/utils/getRedis'
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

export type PageChunkerName = 'markdown' | 'sections'
export type DiscussionTextFormat = 'narrated' | 'plain'

export interface EmbeddingModelParams {
  embeddingDimensions: number
  precision: 32 | 16
  tableSuffix: string
  languages: readonly ISO6391[]
  chunker: PageChunkerName
  pageVectorFloor: number
  pageAlpha: number
  searchPrompt: string
  discussionText: DiscussionTextFormat
  relatedDiscussionPrompt: string | null
  relatedDiscussionFloor: number
  reflectionPrompt: string
  similarWordingThreshold: number
  templateSearchFloor: number
  templateSearchGap: number
}

const FILL_TIER_STEP = 10_000_000

const daysSince = (column: string) =>
  sql<number>`floor(extract(epoch from now() - ${sql.ref(column)}) / 86400)::int`

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  readonly embeddingDimensions: number
  readonly embeddingPrecision: 32 | 16
  readonly maxInputTokens: number
  readonly tableName: EmbeddingsTable
  readonly pagesTableName: EmbeddingsPagesTable
  readonly languages: readonly ISO6391[]
  readonly chunker: PageChunkerName
  readonly searchPrompt: string
  readonly discussionText: DiscussionTextFormat
  readonly reflectionPrompt: string
  readonly modelId: ModelId
  isReady = false
  constructor(modelId: ModelId, url: string, maxTokens: number) {
    super(url)
    this.modelId = modelId
    const modelParams = this.constructModelParams(modelId)
    this.embeddingDimensions = modelParams.embeddingDimensions
    this.embeddingPrecision = modelParams.precision
    this.languages = modelParams.languages
    this.chunker = modelParams.chunker
    this.searchPrompt = modelParams.searchPrompt
    this.discussionText = modelParams.discussionText
    this.reflectionPrompt = modelParams.reflectionPrompt
    this.maxInputTokens = maxTokens
    this.tableName = getEmbeddingsTableName(modelId)
    this.pagesTableName = getEmbeddingsPagesTableName(modelId)!
  }
  protected abstract constructModelParams(modelId: ModelId): EmbeddingModelParams
  async getEmbedding(content: string, retries?: number): Promise<number[] | Error> {
    const result = await this.getEmbeddingWithTokens(content, retries)
    return result instanceof Error ? result : result.embedding
  }
  abstract getEmbeddingWithTokens(
    content: string,
    retries?: number
  ): Promise<{embedding: number[]; tokens: number} | Error>
  getSearchEmbedding(query: string) {
    return this.getEmbedding(`${this.searchPrompt}${query}`)
  }
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

  async createEmbeddingsForModel(db: Kysely<DB> = getKysely()) {
    Logger.log(`Queueing EmbeddingsMetadata, Pages into EmbeddingsJobQueueV2 for ${this.modelId}`)
    const basePriority = await getEmbedderJobPriority('modelUpdate', null, 0)
    await db
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'modelId', 'jobData'])
      .expression(({selectFrom}) =>
        selectFrom('EmbeddingsMetadata')
          .select(({ref}) => [
            sql.lit('embed:start').as('jobType'),
            sql<number>`${sql.lit(basePriority)} + CASE
              WHEN "teamId" = 'aGhostTeam' OR "objectType" = 'retroReflection' THEN 0
              WHEN "objectType" = 'meetingTemplate' THEN ${sql.lit(FILL_TIER_STEP)}
              ELSE ${sql.lit(2 * FILL_TIER_STEP)} + ${daysSince('refUpdatedAt')}
            END`.as('priority'),
            ref('id').as('embeddingsMetadataId'),
            sql.lit(this.modelId).as('modelId'),
            sql<string>`'{"forceBuildText": true}'::jsonb`.as('jobData')
          ])
          .where('language', 'in', this.languages)
          .where(({eb, or, and}) =>
            or([
              // meetingTemplates are small & parabol-provided ones are older than a year
              eb('objectType', '=', 'meetingTemplate'),
              // for new models, we only grab a year's worth of data
              and([
                eb('objectType', '=', 'retrospectiveDiscussionTopic'),
                eb('refUpdatedAt', '>', sql<Date>`NOW() - INTERVAL '1 year'`)
              ]),
              and([
                eb('objectType', '=', 'retroReflection'),
                eb.exists(
                  eb
                    .selectFrom('RetroReflection as r')
                    .innerJoin('NewMeeting as nm', 'nm.id', 'r.meetingId')
                    .select('r.id')
                    .whereRef('r.id', '=', 'EmbeddingsMetadata.refId')
                    .where('nm.endedAt', 'is', null)
                )
              ])
            ])
          )
      )
      .onConflict((oc) => oc.doNothing())
      .execute()

    await db
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['jobType', 'priority', 'pageId', 'modelId'])
      .expression(({selectFrom}) =>
        selectFrom('Page')
          .select(({ref}) => [
            sql.lit('embedPage:start').as('jobType'),
            sql<number>`${sql.lit(basePriority + 3 * FILL_TIER_STEP)} + ${daysSince('updatedAt')}`.as(
              'priority'
            ),
            ref('id').as('pageId'),
            sql.lit(this.modelId).as('modelId')
          ])
          .where(sql<number>`octet_length("plaintextContent")`, '>=', VECTOR_MIN_PAGE_BYTES)
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
    Logger.log(
      `ModelManager: creating ${this.tableName}, ${this.pagesTableName} with ${this.embeddingDimensions} dimensions`
    )
    await pg.transaction().execute(async (trx) => {
      // Creating the foreign keys locks Page and EmbeddingsMetadata against writes until commit,
      // so the long insert goes first
      await this.createEmbeddingsForModel(trx)
      await this.createVectorTables(trx)
    })
    await getRedis().publish('embeddingsJobAdded', '')
  }

  async createVectorTables(db: Kysely<DB>) {
    const vectorDimensions = this.embeddingDimensions
    const precision = this.embeddingPrecision
    const vectorType = precision === 16 ? 'halfvec' : 'vector'
    const columnType = `${vectorType}(${vectorDimensions})`
    const indexType = `${vectorType}_cosine_ops`
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
      `.execute(db)
  }
}
