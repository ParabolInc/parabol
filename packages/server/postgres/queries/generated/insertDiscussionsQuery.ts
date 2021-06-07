/** Types generated for queries found in "packages/server/postgres/queries/src/insertDiscussionsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type DiscussionTopicTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'InsertDiscussionsQuery' parameters type */
export interface IInsertDiscussionsQueryParams {
  discussions: Array<{
    id: string | null | void
    teamId: string | null | void
    meetingId: string | null | void
    discussionTopicId: string | null | void
    discussionTopicType: DiscussionTopicTypeEnum | null | void
  }>
}

/** 'InsertDiscussionsQuery' return type */
export type IInsertDiscussionsQueryResult = void

/** 'InsertDiscussionsQuery' query type */
export interface IInsertDiscussionsQueryQuery {
  params: IInsertDiscussionsQueryParams
  result: IInsertDiscussionsQueryResult
}

const insertDiscussionsQueryIR: any = {
  name: 'insertDiscussionsQuery',
  params: [
    {
      name: 'discussions',
      codeRefs: {
        defined: {a: 43, b: 53, line: 3, col: 9},
        used: [{a: 237, b: 247, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['id', 'teamId', 'meetingId', 'discussionTopicId', 'discussionTopicType']
      }
    }
  ],
  usedParamSet: {discussions: true},
  statement: {
    body:
      'INSERT INTO "Discussion" ("id", "teamId", "meetingId", "discussionTopicId", "discussionTopicType")\nVALUES :discussions',
    loc: {a: 130, b: 247, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Discussion" ("id", "teamId", "meetingId", "discussionTopicId", "discussionTopicType")
 * VALUES :discussions
 * ```
 */
export const insertDiscussionsQuery = new PreparedQuery<
  IInsertDiscussionsQueryParams,
  IInsertDiscussionsQueryResult
>(insertDiscussionsQueryIR)
