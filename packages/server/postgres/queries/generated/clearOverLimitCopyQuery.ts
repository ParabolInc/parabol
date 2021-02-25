/** Types generated for queries found in "packages/server/postgres/queries/src/clearOverLimitCopyQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'ClearOverLimitCopyQuery' parameters type */
export interface IClearOverLimitCopyQueryParams {
  ids: Array<string | null | void>
}

/** 'ClearOverLimitCopyQuery' return type */
export type IClearOverLimitCopyQueryResult = void

/** 'ClearOverLimitCopyQuery' query type */
export interface IClearOverLimitCopyQueryQuery {
  params: IClearOverLimitCopyQueryParams
  result: IClearOverLimitCopyQueryResult
}

const clearOverLimitCopyQueryIR: any = {
  name: 'clearOverLimitCopyQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 44, b: 46, line: 3, col: 9},
        used: [{a: 116, b: 118, line: 7, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'UPDATE "User" SET\n  "overLimitCopy" = NULL\nWHERE id IN :ids',
    loc: {a: 60, b: 118, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   "overLimitCopy" = NULL
 * WHERE id IN :ids
 * ```
 */
export const clearOverLimitCopyQuery = new PreparedQuery<
  IClearOverLimitCopyQueryParams,
  IClearOverLimitCopyQueryResult
>(clearOverLimitCopyQueryIR)
