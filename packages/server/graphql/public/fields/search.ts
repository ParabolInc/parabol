import {GraphQLError} from 'graphql'
import {type ExpressionBuilder, type StringReference, sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../../embedder/getEmbeddingsTableName'
import {getTSV, type TSVLanguage} from '../../../../embedder/getSupportedLanguages'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import {inferLanguage} from '../../../../embedder/inferLanguage'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {getUserQueryJobData, publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {UserResolvers} from '../resolverTypes'

function RRF<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  kRankCol: StringReference<DB, TB>,
  vRankCol: StringReference<DB, TB>,
  alpha: number,
  k: number
) {
  return sql<number>`
      (${1 - alpha} * coalesce(1.0 / (${k} + ${eb.ref(vRankCol)}), 0.0)) + (${alpha} * coalesce(1.0 / (${k} + ${eb.ref(kRankCol)}), 0.0))`
}

function cosineSimilarity<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  vector: Float32Array | number[]
) {
  return sql<number>`1 - (${eb.ref(column)} <=> ${numberVectorToString(vector)})`
}

function tsvSimilarity<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  language: TSVLanguage,
  query: string
) {
  return sql<number>`ts_rank_cd(${eb.ref(column)}, websearch_to_tsquery(${language}, ${query}), 8)`
}

function rank<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>
) {
  return sql<number>`row_number() over(order by ${eb.ref(column)} desc)::int`
}

export function cosineDistance<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  vector: Float32Array | number[]
) {
  return sql<number>`${eb.ref(column)} <=> ${numberVectorToString(vector)}`
}

export const search: NonNullable<UserResolvers['search']> = async (
  _source,
  {query, after, alpha, dateField, endAt, first, startAt, teamIds, types},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const safeAlpha = alpha ?? 0.75
  const k = 60 // RRF constant

  if (safeAlpha < 0 || safeAlpha > 1) throw new GraphQLError('Alpha must be between 0 and 1')
  if (query.length === 0) throw new GraphQLError('Query must not be empty')
  if (query.length > 5000) throw new GraphQLError('Query is too long')
  if (first || after) throw new GraphQLError('Pagination not implemented')
  if (teamIds?.length) throw new GraphQLError('teamIds not implemented')

  const vector = await publishToEmbedder({
    jobType: 'userQuery:start',
    dataLoader,
    userId: viewerId,
    data: getUserQueryJobData(query)
  })
  const language = inferLanguage(query) || 'en'
  const tsvLanguage = getTSV(language) || 'english'
  const pg = getKysely()
  const embeddingsPagesTableName = getEmbeddingsPagesTableName(activeEmbeddingModelId)
  if (!embeddingsPagesTableName) {
    throw new GraphQLError('No embeddings pages table found')
  }
  const useDateFilter = !!(startAt || endAt)
  const safeDateField = dateField || 'createdAt'
  const safeStartAt = startAt || new Date(0)
  const safeEndAt = endAt || new Date(4000)
  if (types.includes('page')) {
    const pageResults = await pg
      .with('Model', (qb) =>
        qb
          .selectFrom('PageAccess')
          .innerJoin(
            embeddingsPagesTableName,
            'PageAccess.pageId',
            `${embeddingsPagesTableName}.pageId`
          )
          .$if(useDateFilter, (qb) =>
            qb
              .innerJoin('Page', 'Page.id', 'PageAccess.pageId')
              .where((eb) => eb.between(safeDateField, safeStartAt, safeEndAt))
          )
          .selectAll(embeddingsPagesTableName)
      )
      .with('VectorSimilarity', (pg) =>
        pg
          .selectFrom('Model')
          .selectAll('Model')
          .select(({eb}) => cosineSimilarity(eb, 'embedding', vector).as('v_similarity'))
          .orderBy('v_similarity', 'desc')
          .limit(10)
      )
      .with('VectorRank', (qb) =>
        qb
          .selectFrom('VectorSimilarity')
          .selectAll('VectorSimilarity')
          .select(({eb}) => rank(eb, 'v_similarity').as('v_rank'))
      )
      .with('KeywordSimilarity', (qb) =>
        qb
          .selectFrom('Model')
          .selectAll('Model')
          .select((eb) => tsvSimilarity(eb, 'tsv', tsvLanguage, query).as('k_similarity'))
          .where('tsv', '@@', sql<string>`websearch_to_tsquery(${tsvLanguage}, ${query})`)
          .orderBy('k_similarity', 'desc')
          .limit(10)
      )
      .with('KeywordRank', (qb) =>
        qb
          .selectFrom('KeywordSimilarity')
          .selectAll('KeywordSimilarity')
          .select(({eb}) => rank(eb, 'k_similarity').as('k_rank'))
      )
      .with('RRF', (qb) =>
        qb
          .selectFrom('VectorRank')
          .fullJoin('KeywordRank', 'VectorRank.id', 'KeywordRank.id')
          .select(({eb, fn}) => [
            fn.coalesce('VectorRank.id', 'KeywordRank.id').as('id'),
            fn.coalesce('VectorRank.pageId', 'KeywordRank.pageId').as('pageId'),
            fn.coalesce('VectorRank.chunkNumber', 'KeywordRank.chunkNumber').as('chunkNumber'),
            'k_rank',
            'v_rank',
            'k_similarity',
            'v_similarity',
            RRF(eb, 'v_rank', 'k_rank', safeAlpha, k).as('score')
          ])
      )
      .with('ChunkMax', (qc) =>
        qc
          .selectFrom('RRF')
          .selectAll()
          .distinctOn('pageId')
          .orderBy('pageId')
          .orderBy('score', 'desc')
      )
      .selectFrom('ChunkMax')
      .selectAll()
      .orderBy('score', 'desc')
      .$call((qb) => {
        const comp = qb.compile().sql
        console.log(comp)
        return qb
      })
      .execute()
    console.log('pageResults', pageResults)
    return {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null
      },
      edges: pageResults.map((pr) => ({
        id: pr.id,
        score: {
          keyword: pr.k_similarity,
          vector: pr.v_similarity,
          vectorRank: pr.v_rank,
          keywordRank: pr.k_rank,
          combined: pr.score
        },
        title: '',
        snippets: ['']
        // node:
      }))
    }
  }
  return null as any
}
