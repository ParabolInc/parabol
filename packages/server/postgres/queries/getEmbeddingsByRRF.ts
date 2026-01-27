import {GraphQLError} from 'graphql'
import type {NotNull} from 'kysely'
import {sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsTableName} from '../../../embedder/getEmbeddingsTableName'
import {getTSV} from '../../../embedder/getSupportedLanguages'
import {inferLanguage} from '../../../embedder/inferLanguage'
import type {SearchTypeEnum} from '../../graphql/public/resolverTypes'
import {cosineSimilarity, RRF, rank, tsHeadline, tsvSimilarity} from '../expressions'
import getKysely from '../getKysely'

interface Params {
  query: string
  queryVector: Float32Array
  alpha: number
  k: number
  first: number
  after: {
    afterIds: (number | string)[]
    maxScore: number
  } | null
  dateRange: {
    startAt: Date
    endAt: Date
    dateField: 'createdAt' | 'updatedAt'
  } | null
  teamIds: string[]
  type: Exclude<SearchTypeEnum, 'page'>
}

export const getEmbeddingsByRRF = async (params: Params) => {
  const {query, queryVector, first, after, dateRange, teamIds, alpha, k, type} = params
  const pg = getKysely()
  const tableName = getEmbeddingsTableName(activeEmbeddingModelId)
  if (!tableName) {
    throw new GraphQLError('No embeddings pages table found')
  }
  const language = inferLanguage(query) || 'en'
  const tsvLanguage = getTSV(language) || 'english'

  const results = await pg
    .with('Model', (qb) =>
      qb
        .selectFrom('EmbeddingsMetadata')
        .innerJoin(tableName, 'EmbeddingsMetadata.id', `${tableName}.embeddingsMetadataId`)
        .$if(teamIds.length > 0, (qb) => qb.where('teamId', 'in', teamIds))
        .where('EmbeddingsMetadata.objectType', '=', type)
        .$if(!!dateRange, (qb) =>
          qb
            // we don't update discussion topics, so we only use refUpdatedAt
            .where((eb) => eb.between('refUpdatedAt', dateRange!.startAt, dateRange!.endAt))
        )
        .selectAll(tableName)
        .select(['refId', 'fullText'])
        .select(sql<string>`websearch_to_tsquery(${tsvLanguage}, ${query})`.as('webQuery'))
    )
    .with('VectorSimilarity', (pg) =>
      pg
        .selectFrom('Model')
        .selectAll('Model')
        .select(({eb}) => cosineSimilarity(eb, 'embedding', queryVector).as('v_similarity'))
        .$if(!!after, (qb) =>
          qb.where('embeddingsMetadataId', 'not in', after!.afterIds as number[])
        )
        .orderBy('v_similarity', 'desc')
        .limit(first + 100)
    )
    .with('VectorRank', (qb) =>
      qb
        .selectFrom('VectorSimilarity')
        .selectAll('VectorSimilarity')
        .select(({eb}) => rank(eb, 'v_similarity').as('v_rank'))
        .$if(!!after, (qb) => qb.where('v_similarity', '<', after!.maxScore))
    )
    .with('KeywordSimilarity', (qb) =>
      qb
        .selectFrom('Model')
        .selectAll('Model')
        .select((eb) => [tsvSimilarity(eb, 'tsv', 'Model.webQuery').as('k_similarity')])
        // Always do a where match, since that can be completed in the GIN index
        .whereRef('tsv', '@@', 'Model.webQuery')
        .$if(!!after, (qb) =>
          qb.where('embeddingsMetadataId', 'not in', after!.afterIds as number[])
        )
        .orderBy('k_similarity', 'desc')
        .limit(first + 100)
    )
    .with('KeywordRank', (qb) =>
      qb
        .selectFrom('KeywordSimilarity')
        .selectAll('KeywordSimilarity')
        .select(({eb}) => [
          rank(eb, 'k_similarity').as('k_rank')
          // This is different from the Pages embeddings, since embedText is sometimes null here
          // fn
          //   .coalesce('KeywordSimilarity.embedText', 'fullText')
          //   .as('embedText')
        ])
        .$if(!!after, (qb) => qb.where('k_similarity', '<', after!.maxScore))
    )
    .with('RRF', (qb) =>
      qb
        .selectFrom('VectorRank')
        .fullJoin('KeywordRank', 'VectorRank.id', 'KeywordRank.id')
        .select(({eb, fn}) => [
          fn.coalesce('VectorRank.id', 'KeywordRank.id').as('id'),
          fn
            .coalesce('VectorRank.embeddingsMetadataId', 'KeywordRank.embeddingsMetadataId')
            .as('embeddingsMetadataId'),
          fn.coalesce('VectorRank.chunkNumber', 'KeywordRank.chunkNumber').as('chunkNumber'),
          fn.coalesce('VectorRank.refId', 'KeywordRank.refId').as('refId'),
          'k_rank',
          'v_rank',
          'k_similarity',
          'v_similarity',
          fn.coalesce('KeywordRank.embedText', 'KeywordRank.fullText').as('embedText'),
          'KeywordRank.webQuery',
          RRF(eb, 'v_rank', 'k_rank', alpha, k).as('score')
        ])
    )
    .with('ChunkMax', (qc) =>
      qc
        .selectFrom('RRF')
        .selectAll()
        .distinctOn('embeddingsMetadataId')
        .orderBy('embeddingsMetadataId')
        .orderBy('score', 'desc')
    )
    .selectFrom('ChunkMax')
    .selectAll()
    .select((eb) =>
      tsHeadline(eb, tsvLanguage, 'ChunkMax.embedText', 'webQuery', {
        StartSel: '<b>',
        StopSel: '</b>',
        MaxWords: 35,
        MaxFragments: 10,
        FragmentDelimiter: '$!$'
      }).as('snippet')
    )
    .$narrowType<{embeddingsMetadataId: NotNull; refId: NotNull}>()
    .orderBy('score', 'desc')
    .limit(first)
    .execute()
  return {
    pageInfo: {
      hasNextPage: results.length > 0,
      hasPreviousPage: false,
      endCursor: btoa(
        JSON.stringify({
          codes: results
            .filter((r) => r.k_similarity && r.v_similarity)
            .map((r) => r.embeddingsMetadataId)
            .join(','),
          maxScore: results.at(-1)?.score ?? 1
        })
      ),
      startCursor: null
    },
    edges: results.map((pr) => ({
      nodeTypeName: type,
      nodeId: pr.refId,
      score: {
        keyword: pr.k_similarity || 0,
        vector: pr.v_similarity || 0,
        vectorRank: pr.v_rank,
        keywordRank: pr.k_rank,
        combined: pr.score
      },
      snippets: pr.snippet?.split('$!$') ?? []
    }))
  }
}
