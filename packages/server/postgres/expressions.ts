import {type Expression, type ExpressionBuilder, type StringReference, sql} from 'kysely'
import {type TSVLanguage} from '../../embedder/getSupportedLanguages'
import numberVectorToString from '../../embedder/indexing/numberVectorToString'

export const RRF_K = 60

export function RRF<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  vRankCol: StringReference<DB, TB>,
  kRankCol: StringReference<DB, TB>,
  alpha: number,
  k: number
) {
  return sql<number>`
      ((${alpha} * coalesce(1.0 / (${k} + ${eb.ref(vRankCol)}), 0.0)) + (${1 - alpha} * coalesce(1.0 / (${k} + ${eb.ref(kRankCol)}), 0.0)))::float8`
}

export function cosineSimilarity<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  vector: Float32Array | number[]
) {
  return sql<number>`1 - (${eb.ref(column)} <=> ${numberVectorToString(vector)})`
}

export function tsvSimilarity<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  webQuery: StringReference<DB, TB>
) {
  return sql<number>`ts_rank_cd(${eb.ref(column)}, ${eb.ref(webQuery)}, 8)`
}

// Only string literals are accepted to prevent SQL injection via ts_headline options concatenation
type StringLiteral<T extends string> = string extends T ? never : T

interface PGHeadlineOptions<TStart extends string, TStop extends string, TDelim extends string> {
  StartSel: StringLiteral<TStart>
  StopSel: StringLiteral<TStop>
  MaxWords: number
  MaxFragments: number
  FragmentDelimiter: StringLiteral<TDelim>
}
export const tsHeadline = <
  DB,
  TB extends keyof DB,
  TStart extends string,
  TStop extends string,
  TDelim extends string
>(
  eb: ExpressionBuilder<DB, TB>,
  language: TSVLanguage,
  embedTextColumn: StringReference<DB, TB>,
  webQuery: StringReference<DB, TB>,
  options: PGHeadlineOptions<TStart, TStop, TDelim>
) => {
  const optionStr = Object.entries(options)
    .map(([key, val]) => `${key}=${val}`)
    .join(', ')
  return sql<string>`ts_headline(${language}, ${eb.ref(embedTextColumn)}, ${eb.ref(webQuery)}, ${optionStr})`
}

export const pageTitleTsv = (title: Expression<string | null>) =>
  sql<string>`to_tsvector('simple', coalesce(${title}, ''))`

export const pageSearchTsv = (title: Expression<string | null>, body: Expression<string | null>) =>
  sql<string>`(setweight(${pageTitleTsv(title)}, 'A') || setweight(to_tsvector('simple', left(coalesce(${body}, ''), 100000)), 'D'))`

export const pageSnippet = (body: Expression<string | null>, tsQuery: Expression<string | null>) =>
  sql<string | null>`ts_headline(
    'simple',
    left(coalesce(${body}, ''), 20000),
    ${tsQuery},
    'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15, MaxFragments=1'
  )`

const MIN_QUERY_TERM_LENGTH = 2
const MAX_QUERY_TERMS = 8

// splits the query into words exactly as pageSearchTsv splits page text, then quotes each word as a prefix term.
// A single digit is an exact term instead: as a prefix, "2" would match the year on every page.
// With dropStopWords, English stop words leave before the cap, unless every word is one.
// A query with no single digits and no words of 2+ characters gives NULL, which matches nothing.
export const pagePrefixTerms = (query: string, dropStopWords: boolean) =>
  sql<string[] | null>`(
    select array_agg('''' || replace(replace(t.lexeme, '\\', '\\\\'), '''', '''''') || case when t.lexeme ~ '^[0-9]$' then '''' else ''':*' end order by t.position)
    from (
      select lexeme, position
      from (
        select lexeme, positions[1] as position, s."isStopWord", bool_and(s."isStopWord") over () as "onlyStopWords"
        from unnest(to_tsvector('simple', ${query}))
          cross join lateral (select ts_lexize('english_stem', lexeme) = '{}' as "isStopWord") s
        where char_length(lexeme) >= ${sql.lit(MIN_QUERY_TERM_LENGTH)} or lexeme ~ '^[0-9]$'
      ) w
      where not (${sql.lit(dropStopWords)} and w."isStopWord" and not w."onlyStopWords")
      order by position
      limit ${sql.lit(MAX_QUERY_TERMS)}
    ) t
  )`

// The terms are cast with ::tsquery, which reads them literally instead of parsing them again.
export const pagePrefixTsQuery = (terms: Expression<string[] | null>, operator: '&' | '|') =>
  sql<string | null>`array_to_string(${terms}, ${sql.lit(` ${operator} `)})::tsquery`

export function rank<DB, TB extends keyof DB>(
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
