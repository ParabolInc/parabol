/** Types generated for queries found in "packages/server/postgres/queries/src/getThreadsByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type ThreadSourceTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'GetThreadsByIdQuery' parameters type */
export interface IGetThreadsByIdQueryParams {
  ids: Array<string | null | void>
}

/** 'GetThreadsByIdQuery' return type */
export interface IGetThreadsByIdQueryResult {
  id: string
  createdAt: Date
  teamId: string
  meetingId: string
  threadSourceId: string
  threadSourceType: ThreadSourceTypeEnum
}

/** 'GetThreadsByIdQuery' query type */
export interface IGetThreadsByIdQueryQuery {
  params: IGetThreadsByIdQueryParams
  result: IGetThreadsByIdQueryResult
}

const getThreadsByIdQueryIR: any = {
  name: 'getThreadsByIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 40, b: 42, line: 3, col: 9},
        used: [{a: 92, b: 94, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT * FROM "Thread"\nWHERE id in :ids',
    loc: {a: 56, b: 94, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Thread"
 * WHERE id in :ids
 * ```
 */
export const getThreadsByIdQuery = new PreparedQuery<
  IGetThreadsByIdQueryParams,
  IGetThreadsByIdQueryResult
>(getThreadsByIdQueryIR)
