/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsOptionsByPollIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type stringArray = string[]

/** 'GetPollOptionsByPollIdQuery' parameters type */
export interface IGetPollOptionsByPollIdQueryParams {
  pollIds: Array<number | null | void>
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
      name: 'pollIds',
      codeRefs: {
        defined: {a: 48, b: 54, line: 3, col: 9},
        used: [{a: 114, b: 120, line: 6, col: 19}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {pollIds: true},
  statement: {
    body: 'SELECT * FROM "PollOption"\nWHERE "pollId" in :pollIds',
    loc: {a: 68, b: 120, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "PollOption"
 * WHERE "pollId" in :pollIds
 * ```
 */
export const getPollOptionsByPollIdQuery = new PreparedQuery<
  IGetPollOptionsByPollIdQueryParams,
  IGetPollOptionsByPollIdQueryResult
>(getPollOptionsByPollIdQueryIR)
