import {sql} from 'kysely'
import type {SearchResultEdgeSource} from '../../graphql/public/types/SearchResultEdge'
import {pagePrefixTsQuery, pageSearchTsv, pageTitleTsv, RRF_K} from '../expressions'
import getKysely from '../getKysely'

export interface PageKeywordSearchParams {
  query: string
  first: number
  viewerId: string
  teamIds: [string, ...string[]] | undefined
  dateRange: {startAt: Date; endAt: Date; dateField: 'createdAt' | 'updatedAt'} | null
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

export const getPagesByKeyword = async ({
  query,
  first,
  viewerId,
  teamIds,
  dateRange
}: PageKeywordSearchParams): Promise<PageSearchResults> => {
  const pageInfo = {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null}
  const tsQuery = sql.ref<string>('st.terms')
  const rows = await getKysely()
    // search terms: the query split into words the same way page text is, each word a required prefix
    .with('SearchTerms', (qb) => qb.selectNoFrom(pagePrefixTsQuery(query).as('terms')))
    .with('Matches', (qb) =>
      qb
        // who can see what: a `PageAccess` join on `viewerId`, plus `deletedAt` is null
        .selectFrom('PageAccess as pa')
        .innerJoin('Page as p', 'p.id', 'pa.pageId')
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
        .where('pa.userId', '=', viewerId)
        .where('p.deletedAt', 'is', null)
        // matching: the page's search text contains every term
        .where((eb) => eb('s.searchTsv', '@@', tsQuery))
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
        .select((eb) => [
          'p.id',
          'p.updatedAt',
          eb(pageTitleTsv(eb.ref('p.title')), '@@', tsQuery).as('titleMatch'),
          sql<number>`ts_rank_cd(${eb.ref('s.searchTsv')}, ${tsQuery}, 0)::float8`.as(
            'keywordScore'
          )
        ])
        // ordering: title matches first, then rank, then most recently updated, then id for stable ties
        .orderBy('titleMatch', 'desc')
        .orderBy('keywordScore', 'desc')
        .orderBy('p.updatedAt', 'desc')
        .orderBy('p.id', 'desc')
        .limit(first)
    )
    // output: each page's position in that order, plus a highlighted snippet from the first 20k characters
    .selectFrom('Matches as m')
    .innerJoin('Page as p', 'p.id', 'm.id')
    .crossJoin('SearchTerms as st')
    .select((eb) => [
      'm.id',
      'm.keywordScore',
      sql<number>`row_number() over (order by ${eb.ref('m.titleMatch')} desc, ${eb.ref('m.keywordScore')} desc, ${eb.ref('m.updatedAt')} desc, ${eb.ref('m.id')} desc)::int`.as(
        'keywordRank'
      ),
      sql<string>`ts_headline('simple', left(coalesce(${eb.ref('p.plaintextContent')}, ''), 20000), ${tsQuery}, 'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15, MaxFragments=1')`.as(
        'snippet'
      )
    ])
    .orderBy('keywordRank')
    .execute()
  // result shape: keyword-only scores in the same shape fused results use, on a single page
  return {
    pageInfo,
    edges: rows.map(({id, keywordScore, keywordRank, snippet}) => ({
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
