/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'GetPollsByIdQuery' parameters type */
export interface IGetPollsByIdQueryParams {
  ids: Array<number | null | void>
}

/** 'GetPollsByIdQuery' return type */
export interface IGetPollsByIdQueryResult {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  endedAt: Date | null
  createdById: string
  discussionId: string
  teamId: string
  threadSortOrder: number
  meetingId: string | null
  title: string | null
}

/** 'GetPollsByIdQuery' query type */
export interface IGetPollsByIdQueryQuery {
  params: IGetPollsByIdQueryParams
  result: IGetPollsByIdQueryResult
}

const getPollsByIdQueryIR: any = {
  name: 'getPollsByIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 38, b: 40, line: 3, col: 9},
        used: [{a: 88, b: 90, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {body: 'SELECT * FROM "Poll"\nWHERE id in :ids', loc: {a: 54, b: 90, line: 5, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Poll"
 * WHERE id in :ids
 * ```
 */
export const getPollsByIdQuery = new PreparedQuery<
  IGetPollsByIdQueryParams,
  IGetPollsByIdQueryResult
>(getPollsByIdQueryIR)
