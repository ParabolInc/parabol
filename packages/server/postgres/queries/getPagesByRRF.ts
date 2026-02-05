import {GraphQLError} from 'graphql'
import type {NotNull} from 'kysely'
import {sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {getTSV} from '../../../embedder/getSupportedLanguages'
import {inferLanguage} from '../../../embedder/inferLanguage'
import {CipherId} from '../../utils/CipherId'
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
  teamIds: string[] | null | undefined
  viewerId: string
}

export const getPagesByRRF = async (params: Params) => {
  const {query, queryVector, first, after, dateRange, teamIds, alpha, k, viewerId} = params
  const pg = getKysely()
  const tableName = getEmbeddingsPagesTableName(activeEmbeddingModelId)
  if (!tableName) {
    throw new GraphQLError('No embeddings pages table found')
  }
  const language = inferLanguage(query) || 'en'
  const tsvLanguage = getTSV(language) || 'english'

  const results = await pg
    .with('Model', (qb) =>
      qb
        .selectFrom('PageAccess')
        .where('PageAccess.userId', '=', viewerId)
        .innerJoin(tableName, 'PageAccess.pageId', `${tableName}.pageId`)
        .$if(!!dateRange, (qb) =>
          qb
            .innerJoin('Page', 'Page.id', 'PageAccess.pageId')
            .where((eb) => eb.between(dateRange!.dateField, dateRange!.startAt, dateRange!.endAt))
        )
        .$if(!!teamIds, (qb) =>
          qb
            .innerJoin('PageTeamAccess', 'PageTeamAccess.pageId', `${tableName}.pageId`)
            .where('PageTeamAccess.teamId', 'in', teamIds!)
        )
        .selectAll(tableName)
        .select(sql<string>`websearch_to_tsquery(${tsvLanguage}, ${query})`.as('webQuery'))
    )
    .with('VectorSimilarity', (pg) =>
      pg
        .selectFrom('Model')
        .selectAll('Model')
        .select(({eb}) => cosineSimilarity(eb, 'embedding', queryVector).as('v_similarity'))
        .$if(!!after, (qb) => qb.where('pageId', 'not in', after!.afterIds as number[]))
        .orderBy('v_similarity', 'desc')
        // technically, we need more than first + 1 since these are chunks & `first` refers to pages
        // it's possible a chunk returns at position first + 1 in vector, and first + 2 in keyword, thus excluding & reducing the score
        // That's why the after cursor doesn't remove a pageId until it gets a hit in both
        // However,
        .limit(first + 1)
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
        .$if(!!after, (qb) => qb.where('pageId', 'not in', after!.afterIds as number[]))
        .orderBy('k_similarity', 'desc')
        .limit(first + 1)
    )
    .with('KeywordRank', (qb) =>
      qb
        .selectFrom('KeywordSimilarity')
        .selectAll('KeywordSimilarity')
        .select(({eb}) => rank(eb, 'k_similarity').as('k_rank'))
        .$if(!!after, (qb) => qb.where('k_similarity', '<', after!.maxScore))
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
          'KeywordRank.embedText',
          'KeywordRank.webQuery',
          RRF(eb, 'v_rank', 'k_rank', alpha, k).as('score')
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
    .$narrowType<{pageId: NotNull}>()
    .select((eb) =>
      tsHeadline(eb, tsvLanguage, 'embedText', 'webQuery', {
        StartSel: '<b>',
        StopSel: '</b>',
        MaxWords: 35,
        MaxFragments: 10,
        FragmentDelimiter: '$!$'
      }).as('snippet')
    )
    .orderBy('score', 'desc')
    .limit(first)
    .execute()
  return {
    pageInfo: {
      // Our query is for chunks, but the request is for pages, so we can't safely guarantee there are no more results
      // unless both Vector & Keyword searches were first * max number of chunks, which is a gross overfetch
      hasNextPage: results.length > 0,
      hasPreviousPage: false,
      endCursor: btoa(
        JSON.stringify({
          codes: results
            .filter((r) => r.k_similarity && r.v_similarity)
            .map((r) => CipherId.encrypt(r.pageId))
            .join(','),
          maxScore: results.at(-1)?.score ?? 1
        })
      ),
      startCursor: ''
    },
    edges: results.map((pr) => ({
      nodeTypeName: 'page' as const,
      nodeId: pr.pageId,
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
