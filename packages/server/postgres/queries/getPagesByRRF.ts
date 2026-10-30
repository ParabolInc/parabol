import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsPagesTableName} from '../../../embedder/getEmbeddingsTableName'
import {cosineSimilarity, pageSnippet, RRF} from '../expressions'
import {
  type KeywordMatching,
  type PageKeywordSearchParams,
  type PageSearchResults,
  withPageKeywordRanking
} from './getPagesByKeyword'
import {getPageSearchPageInfo} from './pageSearchCursor'

export const VECTOR_SIMILARITY_FLOOR = 0.4
export const VECTOR_MIN_PAGE_BYTES = 200
export const FUSED_KEYWORD_MATCHING: KeywordMatching = {
  dropStopWords: true,
  anyWordFallbackBelow: 20,
  anyWordMinShare: 0.5,
  titleTypoSimilarity: 0.5
}

export const getPagesByRRF = async ({
  query,
  queryVector,
  alpha,
  k,
  first,
  offset,
  viewerId,
  teamIds,
  dateRange,
  vectorFloor = VECTOR_SIMILARITY_FLOOR,
  vectorMinBytes = VECTOR_MIN_PAGE_BYTES,
  dropStopWords = FUSED_KEYWORD_MATCHING.dropStopWords,
  anyWordFallbackBelow = FUSED_KEYWORD_MATCHING.anyWordFallbackBelow,
  anyWordMinShare = FUSED_KEYWORD_MATCHING.anyWordMinShare,
  titleTypoSimilarity = FUSED_KEYWORD_MATCHING.titleTypoSimilarity
}: PageKeywordSearchParams &
  Partial<KeywordMatching> & {
    queryVector: Float32Array
    alpha: number
    k: number
    vectorFloor?: number
    vectorMinBytes?: number
  }): Promise<PageSearchResults> => {
  const tableName = getEmbeddingsPagesTableName(activeEmbeddingModelId)
  if (!tableName) {
    throw new GraphQLError('No embeddings pages table found')
  }
  const rows = await withPageKeywordRanking({
    query,
    viewerId,
    teamIds,
    dateRange,
    dropStopWords,
    anyWordFallbackBelow,
    anyWordMinShare,
    titleTypoSimilarity
  })
    .with('PageBestChunk', (qb) =>
      qb
        .selectFrom('ViewerPages as vp')
        .innerJoin(`${tableName} as c`, 'c.pageId', 'vp.id')
        .innerJoin('Page as p', 'p.id', 'vp.id')
        .$if(vectorMinBytes > 0, (qb) =>
          qb.where(
            sql<number>`octet_length(${sql.ref('p.plaintextContent')})`,
            '>=',
            vectorMinBytes
          )
        )
        .select((eb) => [
          'vp.id',
          'vp.updatedAt',
          sql<number>`max(nullif(${cosineSimilarity(eb, 'c.embedding', queryVector)}, 'NaN'))::float8`.as(
            'vectorScore'
          )
        ])
        .groupBy(['vp.id', 'vp.updatedAt'])
    )
    .with('VectorRanked', (qb) =>
      qb
        .selectFrom('PageBestChunk')
        .where('vectorScore', '>=', vectorFloor)
        .select((eb) => [
          'id',
          'updatedAt',
          'vectorScore',
          sql<number>`row_number() over (order by ${eb.ref('vectorScore')} desc, ${eb.ref('updatedAt')} desc, ${eb.ref('id')} desc)::int`.as(
            'vectorRank'
          )
        ])
    )
    .with('Fused', (qb) =>
      qb
        .selectFrom('KeywordRanked as kr')
        .fullJoin('VectorRanked as vr', 'vr.id', 'kr.id')
        .select((eb) => [
          eb.fn.coalesce('kr.id', 'vr.id').as('id'),
          eb.fn.coalesce('kr.updatedAt', 'vr.updatedAt').as('updatedAt'),
          'kr.hasEveryWord',
          'kr.keywordScore',
          'kr.keywordRank',
          'vr.vectorScore',
          'vr.vectorRank',
          RRF(eb, 'vr.vectorRank', 'kr.keywordRank', alpha, k).as('combined')
        ])
        .orderBy('combined', 'desc')
        .orderBy('updatedAt', 'desc')
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(first + 1)
    )
    .selectFrom('Fused as f')
    .innerJoin('Page as p', 'p.id', 'f.id')
    .crossJoin('SearchTerms as st')
    .select((eb) => [
      'p.id',
      'f.keywordScore',
      'f.keywordRank',
      'f.vectorScore',
      'f.vectorRank',
      'f.combined',
      pageSnippet(
        eb.ref('p.plaintextContent'),
        sql<string>`case when ${eb.ref('f.hasEveryWord')} then ${eb.ref('st.terms')} else ${eb.ref('st.anyTerms')} end`
      ).as('snippet')
    ])
    .orderBy('f.combined', 'desc')
    .orderBy('f.updatedAt', 'desc')
    .orderBy('f.id', 'desc')
    .execute()
  const pageRows = rows.slice(0, first)
  return {
    pageInfo: getPageSearchPageInfo('fused', offset, pageRows.length, rows.length > first),
    edges: pageRows.map(
      ({id, keywordScore, keywordRank, vectorScore, vectorRank, combined, snippet}) => ({
        nodeTypeName: 'page' as const,
        nodeId: id,
        score: {
          keyword: keywordScore ?? 0,
          vector: vectorScore ?? 0,
          keywordRank: keywordRank ?? null,
          vectorRank: vectorRank ?? null,
          combined
        },
        snippets: snippet ? [snippet] : []
      })
    )
  }
}
