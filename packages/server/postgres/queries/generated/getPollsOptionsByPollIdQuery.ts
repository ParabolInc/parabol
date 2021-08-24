/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsOptionsByPollIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type stringArray = string[]

/** 'GetPollOptionsByPollIdQuery' parameters type */
export interface IGetPollOptionsByPollIdQueryParams {
  ids: Array<number | null | void>
}

/** 'GetPollOptionsByPollIdQuery' return type */
export interface IGetPollOptionsByPollIdQueryResult {
  id: number
  createdAt: Date
  updatedAt: Date
  pollId: number
  voteUserIds: stringArray
  title: string | null
}

/** 'GetPollOptionsByPollIdQuery' query type */
export interface IGetPollOptionsByPollIdQueryQuery {
  params: IGetPollOptionsByPollIdQueryParams
  result: IGetPollOptionsByPollIdQueryResult
}

const getPollOptionsByPollIdQueryIR: any = {
  name: 'getPollOptionsByPollIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 48, b: 50, line: 3, col: 9},
        used: [{a: 104, b: 106, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT * FROM "PollOption"\nWHERE id in :ids',
    loc: {a: 64, b: 106, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "PollOption"
 * WHERE id in :ids
 * ```
 */
export const getPollOptionsByPollIdQuery = new PreparedQuery<
  IGetPollOptionsByPollIdQueryParams,
  IGetPollOptionsByPollIdQueryResult
>(getPollOptionsByPollIdQueryIR)
