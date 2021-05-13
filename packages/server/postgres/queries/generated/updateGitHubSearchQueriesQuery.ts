/** Types generated for queries found in "packages/server/postgres/queries/src/updateGitHubSearchQueriesQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'UpdateGitHubSearchQueriesQuery' parameters type */
export interface IUpdateGitHubSearchQueriesQueryParams {
  githubSearchQueries: JsonArray | null | void
  teamId: string | null | void
  userId: string | null | void
}

/** 'UpdateGitHubSearchQueriesQuery' return type */
export type IUpdateGitHubSearchQueriesQueryResult = void

/** 'UpdateGitHubSearchQueriesQuery' query type */
export interface IUpdateGitHubSearchQueriesQueryQuery {
  params: IUpdateGitHubSearchQueriesQueryParams
  result: IUpdateGitHubSearchQueriesQueryResult
}

const updateGitHubSearchQueriesQueryIR: any = {
  name: 'updateGitHubSearchQueriesQuery',
  params: [
    {
      name: 'githubSearchQueries',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 97, b: 115, line: 6, col: 27}]}
    },
    {
      name: 'teamId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 135, b: 140, line: 7, col: 18}]}
    },
    {
      name: 'userId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 158, b: 163, line: 7, col: 41}]}
    }
  ],
  usedParamSet: {githubSearchQueries: true, teamId: true, userId: true},
  statement: {
    body:
      'UPDATE "GitHubAuth" SET\n  "githubSearchQueries" = :githubSearchQueries\nWHERE "teamId" = :teamId AND "userId" = :userId',
    loc: {a: 46, b: 163, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "GitHubAuth" SET
 *   "githubSearchQueries" = :githubSearchQueries
 * WHERE "teamId" = :teamId AND "userId" = :userId
 * ```
 */
export const updateGitHubSearchQueriesQuery = new PreparedQuery<
  IUpdateGitHubSearchQueriesQueryParams,
  IUpdateGitHubSearchQueriesQueryResult
>(updateGitHubSearchQueriesQueryIR)
