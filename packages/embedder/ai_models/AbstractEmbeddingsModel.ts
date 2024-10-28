import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/types/pg'
import isValid from '../../server/graphql/isValid'
import {Logger} from '../../server/utils/Logger'
import {getEmbedderPriority} from '../getEmbedderPriority'
import {ISO6391} from '../iso6393To1'
import {URLRegex} from '../regex'
import {AbstractModel} from './AbstractModel'

export interface EmbeddingModelParams {
  embeddingDimensions: number
  maxInputTokens: number
  tableSuffix: string
  languages: ISO6391[]
}
export type EmbeddingsTableName = `Embeddings_${string}`
export type EmbeddingsTable = Extract<keyof DB, EmbeddingsTableName>

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  readonly embeddingDimensions: number
  readonly maxInputTokens: number
  readonly tableName: EmbeddingsTable
  readonly languages: ISO6391[]
  constructor(modelId: string, url: string) {
    super(url)
    const modelParams = this.constructModelParams(modelId)
    this.embeddingDimensions = modelParams.embeddingDimensions
    this.languages = modelParams.languages
    this.maxInputTokens = modelParams.maxInputTokens
    this.tableName = `Embeddings_${modelParams.tableSuffix}` as EmbeddingsTable
  }
  protected abstract constructModelParams(modelId: string): EmbeddingModelParams
  abstract getEmbedding(content: string, retries?: number): Promise<number[] | Error>

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
    Logger.log(`Queueing EmbeddingsMetadata into EmbeddingsJobQueue for ${this.tableName}`)
    const pg = getKysely()
    const priority = getEmbedderPriority(10)
    await pg
      .insertInto('EmbeddingsJobQueue')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'model'])
      .expression(({selectFrom}) =>
        selectFrom('EmbeddingsMetadata')
          .select(({ref}) => [
            sql.lit('embed:start').as('jobType'),
            priority.as('priority'),
            ref('id').as('embeddingsMetadataId'),
            sql.lit(this.tableName).as('model')
          ])
          .where('language', 'in', this.languages)
      )
      .onConflict((oc) => oc.doNothing())
      .execute()
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
    Logger.log(`ModelManager: creating ${this.tableName} with ${vectorDimensions} dimensions`)
    await sql`
      DO $$
        BEGIN
        CREATE TABLE IF NOT EXISTS ${sql.id(this.tableName)} (
          "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          "embedText" TEXT,
          "embedding" vector(${sql.raw(vectorDimensions.toString())}),
          "embeddingsMetadataId" INTEGER NOT NULL,
          "chunkNumber" SMALLINT,
          UNIQUE NULLS NOT DISTINCT("embeddingsMetadataId", "chunkNumber"),
          FOREIGN KEY ("embeddingsMetadataId")
            REFERENCES "EmbeddingsMetadata"("id")
            ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.tableName)}_embedding_vector_cosign_ops"
          ON ${sql.id(this.tableName)}
          USING hnsw ("embedding" vector_cosine_ops);
        END
      $$;
      `.execute(pg)
    await this.createEmbeddingsForModel()
  }
}
