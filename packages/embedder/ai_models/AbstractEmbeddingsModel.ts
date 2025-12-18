import {sql} from 'kysely'
import sleep from 'parabol-client/utils/sleep'
import getKysely from '../../server/postgres/getKysely'
import type {DB} from '../../server/postgres/types/pg'
import {Logger} from '../../server/utils/Logger'
import {getEmbedderPriority} from '../getEmbedderPriority'
import type {ISO6391} from '../iso6393To1'
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
  protected static activeHighPriorityEmbeddings = 0

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
  protected abstract internalGetEmbedding(
    content: string,
    retries?: number
  ): Promise<number[] | Error>

  public async getEmbedding(
    content: string,
    options?: {priority?: 'high' | 'low'; retries?: number}
  ): Promise<number[] | Error> {
    const priority = options?.priority || 'low'
    const retries = options?.retries

    if (priority === 'high') {
      AbstractEmbeddingsModel.activeHighPriorityEmbeddings++
      try {
        return await this.internalGetEmbedding(content, retries)
      } finally {
        AbstractEmbeddingsModel.activeHighPriorityEmbeddings--
      }
    } else {
      while (AbstractEmbeddingsModel.activeHighPriorityEmbeddings > 0) {
        await sleep(100)
      }
      return await this.internalGetEmbedding(content, retries)
    }
  }

  abstract getTokens(content: string): Promise<number[] | Error>

  private normalizeContent = (content: string, truncateUrls: boolean) => {
    if (!truncateUrls) return content.trim()
    // pathname & search can include a lot of garbage that doesn't help the meaning
    return content.trim().replaceAll(URLRegex, (match) => new URL(match).origin)
  }

  async chunkText(content: string) {
    const AVG_CHARS_PER_TOKEN = 4
    const maxContentLength = this.maxInputTokens * AVG_CHARS_PER_TOKEN

    if (content.length < maxContentLength) {
      const tokens = await this.getTokens(content)
      if (!(tokens instanceof Error) && tokens.length <= this.maxInputTokens) {
        return [content]
      }
    }

    const normalizedContent = this.normalizeContent(content, true)

    // Split into sentences to avoid breaking words/sentences mid-way where possible
    const sentences = normalizedContent.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [
      normalizedContent
    ]

    const chunks: string[] = []
    let currentChunkSentences: string[] = []
    let currentChunkLength = 0

    const MAX_CHARS = this.maxInputTokens * (AVG_CHARS_PER_TOKEN * 0.8) // 80% to allow overlap
    const OVERLAP_CHARS = MAX_CHARS * 0.2 // 20% overlap

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      if (!sentence) continue
      const sentenceLen = sentence.length

      if (sentenceLen > MAX_CHARS) {
        if (currentChunkSentences.length > 0) {
          chunks.push(currentChunkSentences.join(''))
          currentChunkSentences = []
          currentChunkLength = 0
        }

        let start = 0
        while (start < sentenceLen) {
          const end = Math.min(start + MAX_CHARS, sentenceLen)
          chunks.push(sentence.slice(start, end))
          start = end - Math.floor(OVERLAP_CHARS) // Overlap
        }
        continue
      }

      if (currentChunkLength + sentenceLen > MAX_CHARS) {
        chunks.push(currentChunkSentences.join(''))

        // Create overlap for next chunk
        let overlapLength = 0
        const overlapSentences = []
        for (let j = currentChunkSentences.length - 1; j >= 0; j--) {
          const s = currentChunkSentences[j]
          if (!s) continue
          if (overlapLength + s.length > OVERLAP_CHARS) break
          overlapSentences.unshift(s)
          overlapLength += s.length
        }

        currentChunkSentences = [...overlapSentences]
        currentChunkLength = overlapLength
      }

      currentChunkSentences.push(sentence)
      currentChunkLength += sentenceLen
    }

    if (currentChunkSentences.length > 0) {
      chunks.push(currentChunkSentences.join(''))
    }

    // Validation pass to ensure chunks are within maxInputTokens
    const validatedChunks: string[] = []
    for (const chunk of chunks) {
      const tokens = await this.getTokens(chunk)
      if (tokens instanceof Error) return tokens

      if (tokens.length <= this.maxInputTokens) {
        validatedChunks.push(chunk)
      } else {
        // Chunk too big: hard split it.
        const subChunks = await this.forceSplit(chunk)
        if (subChunks instanceof Error) return subChunks
        validatedChunks.push(...subChunks)
      }
    }

    return validatedChunks
  }

  private async forceSplit(content: string): Promise<string[] | Error> {
    const mid = Math.floor(content.length / 2)
    let splitIdx = content.lastIndexOf(' ', mid) // Try to split on a space
    if (splitIdx === -1) splitIdx = mid // No space, just split

    const p1 = content.slice(0, splitIdx)
    const p2 = content.slice(splitIdx) // include space in second or drop it? default keep

    const t1 = await this.getTokens(p1)
    if (t1 instanceof Error) return t1

    const r1 = t1.length > this.maxInputTokens ? await this.forceSplit(p1) : [p1]
    if (r1 instanceof Error) return r1

    const t2 = await this.getTokens(p2)
    if (t2 instanceof Error) return t2

    const r2 = t2.length > this.maxInputTokens ? await this.forceSplit(p2) : [p2]
    if (r2 instanceof Error) return r2

    return [...r1, ...r2]
  }

  async createEmbeddingsForModel() {
    Logger.log(`Queueing EmbeddingsMetadata into EmbeddingsJobQueue for ${this.tableName}`)
    const pg = getKysely()
    const priority = getEmbedderPriority(10)
    await pg
      .insertInto('EmbeddingsJobQueue')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'model'])
      .expression((eb: any) =>
        eb
          .selectFrom('EmbeddingsMetadata')
          .select(({ref}: any) => [
            sql.lit('embed:start').as('jobType'),
            priority.as('priority'),
            ref('id').as('embeddingsMetadataId'),
            sql.lit(this.tableName).as('model')
          ])
          .where('language', 'in', this.languages)
      )
      .onConflict((oc: any) => oc.doNothing())
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
          "tsv" tsvector,
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
        CREATE INDEX IF NOT EXISTS "idx_${sql.raw(this.tableName)}_tsv"
          ON ${sql.id(this.tableName)}
          USING GIN ("tsv");
        END
      $$;
      `.execute(pg)
    await this.createEmbeddingsForModel()
  }
}
