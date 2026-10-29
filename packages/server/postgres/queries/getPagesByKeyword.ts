import {sql} from 'kysely'
import type {SearchResultEdgeSource} from '../../graphql/public/types/SearchResultEdge'
import {
  pagePrefixTerms,
  pagePrefixTsQuery,
  pageSearchTsv,
  pageSnippet,
  pageTitleTsv,
  RRF_K
} from '../expressions'
import getKysely from '../getKysely'
import {getPageSearchPageInfo} from './pageSearchCursor'

export interface PageKeywordSearchParams {
  query: string
  first: number
  offset: number
  viewerId: string
  teamIds: [string, ...string[]] | undefined
  dateRange: {startAt: Date; endAt: Date; dateField: 'createdAt' | 'updatedAt'} | null
}

export interface KeywordMatching {
  dropStopWords: boolean
  anyWordFallbackBelow: number
  anyWordMinShare: number
}

export const QUICK_KEYWORD_MATCHING: KeywordMatching = {
  dropStopWords: false,
  anyWordFallbackBelow: 0,
  anyWordMinShare: 0
}

export interface PageSearchResults {
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
  }
  edges: SearchResultEdgeSource[]
}

export const withPageKeywordRanking = (
  {
    query,
    viewerId,
    teamIds,
    dateRange,
    dropStopWords,
    anyWordFallbackBelow,
    anyWordMinShare
  }: Omit<PageKeywordSearchParams, 'first' | 'offset'> & KeywordMatching,
  limit?: number
) => {
  const fallsBack = anyWordFallbackBelow > 0
  return (
    getKysely()
      // search terms: the query split into words the same way page text is, each word a prefix
      .with('SearchTermList', (qb) =>
        qb.selectNoFrom(pagePrefixTerms(query, dropStopWords).as('termList'))
      )
      .with('SearchTerms', (qb) =>
        qb
          .selectFrom('SearchTermList as stl')
          .select((eb) => [
            'stl.termList',
            pagePrefixTsQuery(eb.ref('stl.termList'), '&').as('terms'),
            pagePrefixTsQuery(eb.ref('stl.termList'), '|').as('anyTerms'),
            sql<number>`greatest(1, ceil(${anyWordMinShare}::float8 * cardinality(${eb.ref('stl.termList')})))::int`.as(
              'minAnyWords'
            )
          ])
      )
      .with('ViewerPages', (qb) =>
        qb
          // who can see what: a `PageAccess` join on `viewerId`, plus `deletedAt` is null
          .selectFrom('PageAccess as pa')
          .innerJoin('Page as p', 'p.id', 'pa.pageId')
          .where('pa.userId', '=', viewerId)
          .where('p.deletedAt', 'is', null)
          // team filter: EXISTS so a page shared with several requested teams appears once
          .$if(!!teamIds, (qb) =>
            qb.where((eb) =>
              eb.exists(
                eb
                  .selectFrom('PageTeamAccess as t')
                  .select('t.pageId')
                  .whereRef('t.pageId', '=', 'p.id')
                  .where('t.teamId', 'in', teamIds!)
              )
            )
          )
          // date filter: createdAt or updatedAt within the requested range
          .$if(!!dateRange, (qb) =>
            qb.where((eb) =>
              eb.between(`p.${dateRange!.dateField}`, dateRange!.startAt, dateRange!.endAt)
            )
          )
          .select(['p.id', 'p.updatedAt'])
      )
      .with('KeywordMatches', (qb) =>
        qb
          .selectFrom('ViewerPages as vp')
          .innerJoin('Page as p', 'p.id', 'vp.id')
          .crossJoin('SearchTerms as st')
          // search text: title (weight A) plus the first 100k characters of the body (weight D), built once per page
          .crossJoinLateral((eb) =>
            qb
              .selectNoFrom(
                pageSearchTsv(eb.ref('p.title'), eb.ref('p.plaintextContent')).as('searchTsv')
              )
              // keeps Postgres from inlining the subquery, which would build the tsvector again for the rank
              .offset(0)
              .as('s')
          )
          // matching: the page's search text contains every term, or with the fallback, any of them
          .where((eb) =>
            fallsBack
              ? eb('s.searchTsv', '@@', eb.ref('st.anyTerms'))
              : eb('s.searchTsv', '@@', eb.ref('st.terms'))
          )
          .select((eb) => {
            const hasEveryWord = eb('s.searchTsv', '@@', eb.ref('st.terms'))
            const matchQuery = sql<string>`case when ${hasEveryWord} then ${eb.ref('st.terms')} else ${eb.ref('st.anyTerms')} end`
            const matchedWords = fallsBack
              ? sql<number>`(select count(*) from unnest(${eb.ref('st.termList')}) as t(term) where ${eb.ref('s.searchTsv')} @@ t.term::tsquery)::int`
              : sql<number>`cardinality(${eb.ref('st.termList')})`
            return [
              'vp.id',
              'vp.updatedAt',
              hasEveryWord.as('hasEveryWord'),
              matchedWords.as('matchedWords'),
              eb(pageTitleTsv(eb.ref('p.title')), '@@', matchQuery).as('titleMatch'),
              sql<number>`ts_rank_cd(${eb.ref('s.searchTsv')}, ${matchQuery}, 0)::float8`.as(
                'keywordScore'
              ),
              sql<number>`(count(*) filter (where ${hasEveryWord}) over ())::int`.as(
                'everyWordCount'
              )
            ]
          })
      )
      .with('KeywordRanked', (qb) =>
        qb
          .selectFrom('KeywordMatches as km')
          .crossJoin('SearchTerms as st')
          // fallback: when fewer than anyWordFallbackBelow pages have every word, pages with enough of them follow
          .where((eb) =>
            eb.or([
              eb('km.hasEveryWord', '=', true),
              eb.and([
                eb('km.everyWordCount', '<', anyWordFallbackBelow),
                eb('km.matchedWords', '>=', eb.ref('st.minAnyWords'))
              ])
            ])
          )
          .select((eb) => [
            'km.id',
            'km.updatedAt',
            'km.keywordScore',
            // ordering: most words first, then title matches, then rank, then most recently updated, then id for stable ties
            sql<number>`row_number() over (order by ${eb.ref('km.matchedWords')} desc, ${eb.ref('km.titleMatch')} desc, ${eb.ref('km.keywordScore')} desc, ${eb.ref('km.updatedAt')} desc, ${eb.ref('km.id')} desc)::int`.as(
              'keywordRank'
            )
          ])
          .orderBy('keywordRank')
          .$if(limit !== undefined, (qb) => qb.limit(limit!))
      )
  )
}

export const getPagesByKeyword = async ({
  query,
  first,
  offset,
  viewerId,
  teamIds,
  dateRange,
  dropStopWords = QUICK_KEYWORD_MATCHING.dropStopWords,
  anyWordFallbackBelow = QUICK_KEYWORD_MATCHING.anyWordFallbackBelow,
  anyWordMinShare = QUICK_KEYWORD_MATCHING.anyWordMinShare
}: PageKeywordSearchParams & Partial<KeywordMatching>): Promise<PageSearchResults> => {
  const rows = await withPageKeywordRanking(
    {query, viewerId, teamIds, dateRange, dropStopWords, anyWordFallbackBelow, anyWordMinShare},
    offset + first + 1
  )
    // output: each page's position in that order, plus a highlighted snippet from the first 20k characters
    .selectFrom('KeywordRanked as kr')
    .innerJoin('Page as p', 'p.id', 'kr.id')
    .crossJoin('SearchTerms as st')
    .where('kr.keywordRank', '>', offset)
    .select((eb) => [
      'kr.id',
      'kr.keywordScore',
      'kr.keywordRank',
      pageSnippet(eb.ref('p.plaintextContent'), eb.ref('st.terms')).as('snippet')
    ])
    .orderBy('kr.keywordRank')
    .execute()
  const pageRows = rows.slice(0, first)
  // result shape: keyword-only scores in the same shape fused results use
  return {
    pageInfo: getPageSearchPageInfo('keyword', offset, pageRows.length, rows.length > first),
    edges: pageRows.map(({id, keywordScore, keywordRank, snippet}) => ({
      nodeTypeName: 'page' as const,
      nodeId: id,
      score: {
        keyword: keywordScore,
        vector: 0,
        keywordRank,
        vectorRank: null,
        combined: 1 / (RRF_K + keywordRank)
      },
      snippets: snippet ? [snippet] : []
    }))
  }
}
