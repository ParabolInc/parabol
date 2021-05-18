/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGitHubAuthQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'UpsertGitHubAuthQuery' parameters type */
export interface IUpsertGitHubAuthQueryParams {
  auth: {
    accessToken: string | null | void
    login: string | null | void
    teamId: string | null | void
    userId: string | null | void
    scope: string | null | void
  }
}

/** 'UpsertGitHubAuthQuery' return type */
export type IUpsertGitHubAuthQueryResult = void

/** 'UpsertGitHubAuthQuery' query type */
export interface IUpsertGitHubAuthQueryQuery {
  params: IUpsertGitHubAuthQueryParams
  result: IUpsertGitHubAuthQueryResult
}

const upsertGitHubAuthQueryIR: any = {
  name: 'upsertGitHubAuthQuery',
  params: [
    {
      name: 'auth',
      codeRefs: {
        defined: {a: 42, b: 45, line: 3, col: 9},
        used: [{a: 184, b: 187, line: 6, col: 8}]
      },
      transform: {type: 'pick_tuple', keys: ['accessToken', 'login', 'teamId', 'userId', 'scope']}
    }
  ],
  usedParamSet: {auth: true},
  statement: {
    body:
      'INSERT INTO "GitHubAuth" ("accessToken", "login", "teamId", "userId", "scope")\nVALUES :auth\nON CONFLICT ("userId", "teamId")\nDO UPDATE\nSET ("accessToken", "updatedAt", "isActive", "login", "scope") = (EXCLUDED."accessToken", CURRENT_TIMESTAMP, TRUE, EXCLUDED.login, EXCLUDED.scope)',
    loc: {a: 97, b: 377, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "GitHubAuth" ("accessToken", "login", "teamId", "userId", "scope")
 * VALUES :auth
 * ON CONFLICT ("userId", "teamId")
 * DO UPDATE
 * SET ("accessToken", "updatedAt", "isActive", "login", "scope") = (EXCLUDED."accessToken", CURRENT_TIMESTAMP, TRUE, EXCLUDED.login, EXCLUDED.scope)
 * ```
 */
export const upsertGitHubAuthQuery = new PreparedQuery<
  IUpsertGitHubAuthQueryParams,
  IUpsertGitHubAuthQueryResult
>(upsertGitHubAuthQueryIR)
