/** Types generated for queries found in "packages/server/postgres/queries/src/getDiscussionsByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type DiscussionTopicTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'GetDiscussionsByIdQuery' parameters type */
export interface IGetDiscussionsByIdQueryParams {
  ids: Array<string | null | void>
}

/** 'GetDiscussionsByIdQuery' return type */
export interface IGetDiscussionsByIdQueryResult {
  id: string
  createdAt: Date
  teamId: string
  meetingId: string
  discussionTopicId: string
  discussionTopicType: DiscussionTopicTypeEnum
}

/** 'GetDiscussionsByIdQuery' query type */
export interface IGetDiscussionsByIdQueryQuery {
  params: IGetDiscussionsByIdQueryParams
  result: IGetDiscussionsByIdQueryResult
}

const getDiscussionsByIdQueryIR: any = {
  name: 'getDiscussionsByIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 44, b: 46, line: 3, col: 9},
        used: [{a: 100, b: 102, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT * FROM "Discussion"\nWHERE id in :ids',
    loc: {a: 60, b: 102, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Discussion"
 * WHERE id in :ids
 * ```
 */
export const getDiscussionsByIdQuery = new PreparedQuery<
  IGetDiscussionsByIdQueryParams,
  IGetDiscussionsByIdQueryResult
>(getDiscussionsByIdQueryIR)
