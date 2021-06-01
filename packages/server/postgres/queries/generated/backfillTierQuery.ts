/** Types generated for queries found in "packages/server/postgres/queries/src/backfillTierQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'BackfillTierQuery' parameters type */
export interface IBackfillTierQueryParams {
  users: Array<{
    tier: string | null | void
    id: string | null | void
  }>
}

/** 'BackfillTierQuery' return type */
export type IBackfillTierQueryResult = void

/** 'BackfillTierQuery' query type */
export interface IBackfillTierQueryQuery {
  params: IBackfillTierQueryParams
  result: IBackfillTierQueryResult
}

const backfillTierQueryIR: any = {
  name: 'backfillTierQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 38, b: 42, line: 3, col: 9},
        used: [{a: 135, b: 139, line: 7, col: 14}]
      },
      transform: {type: 'pick_array_spread', keys: ['tier', 'id']}
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body:
      'UPDATE "User" AS u SET\n  "tier" = c."tier"::"TierEnum"\nFROM (VALUES :users) AS c("tier", "id") \nWHERE c."id" = u."id"',
    loc: {a: 66, b: 182, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" AS u SET
 *   "tier" = c."tier"::"TierEnum"
 * FROM (VALUES :users) AS c("tier", "id")
 * WHERE c."id" = u."id"
 * ```
 */
export const backfillTierQuery = new PreparedQuery<
  IBackfillTierQueryParams,
  IBackfillTierQueryResult
>(backfillTierQueryIR)
