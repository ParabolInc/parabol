/** Types generated for queries found in "packages/server/postgres/queries/src/insertPollOptionsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'InsertPollOptionQuery' parameters type */
export interface IInsertPollOptionQueryParams {
  pollOptions: readonly {
    pollId: number | null | void
    title: string | null | void
  }[]
}

/** 'InsertPollOptionQuery' return type */
export type IInsertPollOptionQueryResult = void

/** 'InsertPollOptionQuery' query type */
export interface IInsertPollOptionQueryQuery {
  params: IInsertPollOptionQueryParams
  result: IInsertPollOptionQueryResult
}

const insertPollOptionQueryIR: any = {
  name: 'insertPollOptionQuery',
  params: [
    {
      name: 'pollOptions',
      codeRefs: {
        defined: {a: 42, b: 52, line: 3, col: 9},
        used: [{a: 140, b: 150, line: 8, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['pollId', 'title']}
    }
  ],
  usedParamSet: {pollOptions: true},
  statement: {
    body: 'INSERT INTO "PollOption" (\n  "pollId",\n  "title"\n) VALUES :pollOptions',
    loc: {a: 81, b: 150, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "PollOption" (
 *   "pollId",
 *   "title"
 * ) VALUES :pollOptions
 * ```
 */
export const insertPollOptionQuery = new PreparedQuery<
  IInsertPollOptionQueryParams,
  IInsertPollOptionQueryResult
>(insertPollOptionQueryIR)
