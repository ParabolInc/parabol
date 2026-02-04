import {type ExpressionBuilder, type StringReference, sql} from 'kysely'
import {type TSVLanguage} from '../../embedder/getSupportedLanguages'
import numberVectorToString from '../../embedder/indexing/numberVectorToString'

export function RRF<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  vRankCol: StringReference<DB, TB>,
  kRankCol: StringReference<DB, TB>,
  alpha: number,
  k: number
) {
  return sql<number>`
      (${1 - alpha} * coalesce(1.0 / (${k} + ${eb.ref(vRankCol)}), 0.0)) + (${alpha} * coalesce(1.0 / (${k} + ${eb.ref(kRankCol)}), 0.0))`
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

interface PGHeadlineOptions {
  StartSel: string
  StopSel: string
  MaxWords: number
  MaxFragments: number
  FragmentDelimiter: string
}
export const tsHeadline = <DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  language: TSVLanguage,
  embedTextColumn: StringReference<DB, TB>,
  webQuery: StringReference<DB, TB>,
  options: PGHeadlineOptions
) => {
  const optionStr = Object.entries(options)
    .map(([key, val]) => `${key}=${val}`)
    .join(', ')
  return sql<string>`ts_headline(${language}, ${eb.ref(embedTextColumn)}, ${eb.ref(webQuery)}, ${optionStr})`
}

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
