/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserTiersQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'UpdateUserTiersQuery' parameters type */
export interface IUpdateUserTiersQueryParams {
  users: Array<{
    tier: string | null | void
    id: string | null | void
  }>
}

/** 'UpdateUserTiersQuery' return type */
export type IUpdateUserTiersQueryResult = void

/** 'UpdateUserTiersQuery' query type */
export interface IUpdateUserTiersQueryQuery {
  params: IUpdateUserTiersQueryParams
  result: IUpdateUserTiersQueryResult
}

const updateUserTiersQueryIR: any = {
  name: 'updateUserTiersQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 41, b: 45, line: 3, col: 9},
        used: [{a: 138, b: 142, line: 7, col: 14}]
      },
      transform: {type: 'pick_array_spread', keys: ['tier', 'id']}
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body:
      'UPDATE "User" AS u SET\n  "tier" = c."tier"::"TierEnum"\nFROM (VALUES :users) AS c("tier", "id") \nWHERE c."id" = u."id"',
    loc: {a: 69, b: 185, line: 5, col: 0}
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
export const updateUserTiersQuery = new PreparedQuery<
  IUpdateUserTiersQueryParams,
  IUpdateUserTiersQueryResult
>(updateUserTiersQueryIR)
