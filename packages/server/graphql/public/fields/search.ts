import {GraphQLError} from 'graphql'
import {type ExpressionBuilder, sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {getUserQueryJobData, publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {UserResolvers} from '../resolverTypes'

function cosineSimilarity<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: keyof DB[TB] & string,
  vector: Float32Array | number[]
) {
  return sql<number>`1 - ${eb.ref(column)} <=> ${numberVectorToString(vector)}`
}

function rank<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: keyof DB[TB] & string
) {
  return sql<number>`row_number() over(order by ${eb.ref(column)})`
}

export function cosineDistance<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: keyof DB[TB] & string,
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
  const pg = getKysely()
  const embeddingsPagesTableName = getEmbeddingsPagesTableName(activeEmbeddingModelId)
  const useDateFilter = !!(startAt || endAt)
  const safeDateField = dateField || 'createdAt'
  const safeStartAt = startAt || new Date(0)
  const safeEndAt = endAt || new Date(4000)
  if (types.includes('page')) {
    await pg
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
      .with('CosineSimilarity', (pg) =>
        pg
          .selectFrom('Model')
          .selectAll('Model')
          .select(({eb}) => cosineSimilarity(eb, 'embedding', vector).as('similarity'))
          .orderBy('similarity', 'desc')
          .limit(10)
      )
      .with('CosineRank', (pg) =>
        pg
          .selectFrom('CosineSimilarity')
          .selectAll('CosineSimilarity')
          .select(({eb}) => rank(eb, 'similarity').as('rank'))
      )
      .selectFrom('CosineRank')
      .selectAll()
      // .with('KeywordRank', (db) =>
      //   db
      //     .selectFrom('Model')
      //     .selectAll('Model')

      //     .select([
      //       'id',
      //       'title',
      //       'content',
      //       'category',
      //       'word_count',
      //       sql<number>`row_number() over(order by full_text <@> to_bm25query(${keyword}, 'idx_documents_bm25'))`.as(
      //         'k_rank'
      //       ),
      //       sql<number>`-(full_text <@> to_bm25query(${keyword}, 'idx_documents_bm25'))`.as(
      //         'k_score'
      //       )
      //     ])
      //     .where(sql`full_text <@> to_bm25query(${keyword}, 'idx_documents_bm25')`, '<', 0)
      //     .orderBy(sql`full_text <@> to_bm25query(${keyword}, 'idx_documents_bm25')`)
      //     .limit(10)
      // )
      //   .selectFrom('CosineRank')
      //   .fullJoin('KeywordRank', 'CosineRank.id', 'KeywordRank.id')
      //   .select(({eb, fn, ref}) => [
      //     fn
      //       .coalesce('CosineRank.id', 'KeywordRank.id')
      //       .as('id'),
      //     ref('CosineRank.')
      //     // sql`left(coalesce(CosineRank.content, KeywordRank.content), 200)`.as('content'),
      //     // fn.coalesce('CosineRank.category', 'KeywordRank.category').as('category'),
      //     // fn.coalesce('CosineRank.word_count', 'KeywordRank.word_count').as('word_count'),
      //     'CosineRank.v_rank',
      //     'CosineRank.v_distance',
      //     'KeywordRank.k_rank',
      //     'KeywordRank.k_score',
      //     // The RRF Score Calculation
      //     sql<number>`
      //   (${alpha} * coalesce(1.0 / (${k} + CosineRank.v_rank), 0.0)) +
      //   (${1 - alpha} * coalesce(1.0 / (${k} + k.k_rank), 0.0))
      // `.as('score')
      //   ])
      // .orderBy('score', 'desc')
      .execute()
  }
  return null as any
}
