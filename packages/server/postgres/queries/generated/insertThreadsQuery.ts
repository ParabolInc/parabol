/** Types generated for queries found in "packages/server/postgres/queries/src/insertThreadsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type ThreadSourceTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'InsertThreadsQuery' parameters type */
export interface IInsertThreadsQueryParams {
  threads: Array<{
    id: string | null | void
    teamId: string | null | void
    meetingId: string | null | void
    threadSourceId: string | null | void
    threadSourceType: ThreadSourceTypeEnum | null | void
  }>
}

/** 'InsertThreadsQuery' return type */
export type IInsertThreadsQueryResult = void

/** 'InsertThreadsQuery' query type */
export interface IInsertThreadsQueryQuery {
  params: IInsertThreadsQueryParams
  result: IInsertThreadsQueryResult
}

const insertThreadsQueryIR: any = {
  name: 'insertThreadsQuery',
  params: [
    {
      name: 'threads',
      codeRefs: {
        defined: {a: 39, b: 45, line: 3, col: 9},
        used: [{a: 213, b: 219, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['id', 'teamId', 'meetingId', 'threadSourceId', 'threadSourceType']
      }
    }
  ],
  usedParamSet: {threads: true},
  statement: {
    body:
      'INSERT INTO "Thread" ("id", "teamId", "meetingId", "threadSourceId", "threadSourceType")\nVALUES :threads',
    loc: {a: 116, b: 219, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Thread" ("id", "teamId", "meetingId", "threadSourceId", "threadSourceType")
 * VALUES :threads
 * ```
 */
export const insertThreadsQuery = new PreparedQuery<
  IInsertThreadsQueryParams,
  IInsertThreadsQueryResult
>(insertThreadsQueryIR)
