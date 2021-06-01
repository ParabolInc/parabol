/** Types generated for queries found in "packages/server/postgres/queries/src/backfillSegmentIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'BackfillSegmentIdQuery' parameters type */
export interface IBackfillSegmentIdQueryParams {
  users: Array<{
    segmentId: string | null | void
    id: string | null | void
  }>
}

/** 'BackfillSegmentIdQuery' return type */
export type IBackfillSegmentIdQueryResult = void

/** 'BackfillSegmentIdQuery' query type */
export interface IBackfillSegmentIdQueryQuery {
  params: IBackfillSegmentIdQueryParams
  result: IBackfillSegmentIdQueryResult
}

const backfillSegmentIdQueryIR: any = {
  name: 'backfillSegmentIdQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 43, b: 47, line: 3, col: 9},
        used: [{a: 143, b: 147, line: 7, col: 14}]
      },
      transform: {type: 'pick_array_spread', keys: ['segmentId', 'id']}
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body:
      'UPDATE "User" AS u SET\n  "segmentId" = c."segmentId"\nFROM (VALUES :users) AS c("segmentId", "id") \nWHERE c."id" = u."id"',
    loc: {a: 76, b: 195, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" AS u SET
 *   "segmentId" = c."segmentId"
 * FROM (VALUES :users) AS c("segmentId", "id")
 * WHERE c."id" = u."id"
 * ```
 */
export const backfillSegmentIdQuery = new PreparedQuery<
  IBackfillSegmentIdQueryParams,
  IBackfillSegmentIdQueryResult
>(backfillSegmentIdQueryIR)
