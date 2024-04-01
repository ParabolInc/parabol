import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import isValid from '../../server/graphql/isValid'
import {Logger} from '../../server/utils/Logger'
import {EMBEDDER_JOB_PRIORITY} from '../EMBEDDER_JOB_PRIORITY'
import {ISO6391} from '../iso6393To1'
import {AbstractModel, ModelConfig} from './AbstractModel'

export interface EmbeddingModelParams {
  embeddingDimensions: number
  maxInputTokens: number
  tableSuffix: string
  languages: ISO6391[]
}
export type EmbeddingsTable = Extract<keyof DB, `Embeddings_${string}`>
export interface EmbeddingModelConfig extends ModelConfig {
  tableSuffix: string
}

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  readonly embeddingDimensions: number
  readonly maxInputTokens: number
  readonly tableName: string
  readonly languages: ISO6391[]
  constructor(config: EmbeddingModelConfig) {
    super(config)
    const modelParams = this.constructModelParams(config)
    this.embeddingDimensions = modelParams.embeddingDimensions
    this.languages = modelParams.languages
    this.maxInputTokens = modelParams.maxInputTokens
    this.tableName = `Embeddings_${modelParams.tableSuffix}`
  }
  protected abstract constructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams
  abstract getEmbedding(content: string, retries?: number): Promise<number[] | Error>

  abstract getTokens(content: string): Promise<number[] | Error>

  async chunkText(content: string) {
    const tokens = await this.getTokens(content)
    if (tokens instanceof Error) return tokens
    const isFullTextTooBig = tokens.length > this.maxInputTokens
    if (!isFullTextTooBig) return [content]

    for (let i = 0; i < 3; i++) {
      const tokensPerWord = (4 + i) / 3
      const chunks = this.splitText(content, tokensPerWord)
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
    return new Error(`Text is too long and could not be split into chunks. Is it english?`)
  }
  // private because result must still be too long to go into model. Must verify with getTokens
  private splitText(content: string, tokensPerWord = 4 / 3) {
    // it's actually 4 / 3, but don't want to chance a failed split
    const WORD_LIMIT = Math.floor(this.maxInputTokens / tokensPerWord)
    const chunks: string[] = []
    const delimiters = ['\n\n', '\n', '.', ' ']
    const countWords = (text: string) => text.trim().split(/\s+/).length
    const splitOnDelimiter = (text: string, delimiter: string) => {
      const sections = text.split(delimiter)
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]!
        const sectionWordCount = countWords(section)
        if (sectionWordCount < WORD_LIMIT) {
          // try to merge this section with the last one
          const previousSection = chunks.at(-1)
          if (previousSection) {
            const combinedChunks = `${previousSection}${delimiter}${section}`
            const mergedWordCount = countWords(combinedChunks)
            if (mergedWordCount < WORD_LIMIT) {
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
    splitOnDelimiter(content.trim(), delimiters[0]!)
    return chunks
  }

  async createEmbeddingsForModel() {
    Logger.log(`Queueing EmbeddingsMetadata into EmbeddingsJobQueue for ${this.tableName}`)
    const pg = getKysely()
    await pg
      .insertInto('EmbeddingsJobQueue')
      .columns(['jobData', 'priority'])
      .expression(({selectFrom}) =>
        selectFrom('EmbeddingsMetadata')
          .select(({fn, lit}) => [
            fn('json_build_object', [
              sql.lit('model'),
              sql.lit(this.tableName),
              sql.lit('embeddingsMetadataId'),
              'id'
            ]).as('jobData'),
            lit(EMBEDDER_JOB_PRIORITY.NEW_MODEL).as('priority')
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
    if (hasTable) return undefined
    const vectorDimensions = this.embeddingDimensions
    Logger.log(`ModelManager: creating ${this.tableName} with ${vectorDimensions} dimensions`)
    await sql`
      DO $$
        BEGIN
        CREATE TABLE IF NOT EXISTS ${sql.id(this.tableName)} (
          "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          "embedText" TEXT,
          "embedding" vector(${sql.raw(vectorDimensions.toString())}),
          "embeddingsMetadataId" INTEGER UNIQUE NOT NULL,
          "chunkNumber" SMALLINT,
          UNIQUE("embeddingsMetadataId", "chunkNumber"),
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
