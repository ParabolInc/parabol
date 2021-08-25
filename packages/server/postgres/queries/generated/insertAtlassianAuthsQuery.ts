/** Types generated for queries found in "packages/server/postgres/queries/src/insertAtlassianAuthsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

export type stringArray = string[]

/** 'InsertAtlassianAuthsQuery' parameters type */
export interface IInsertAtlassianAuthsQueryParams {
  auths: readonly {
    accessToken: string | null | void
    refreshToken: string | null | void
    createdAt: Date | null | void
    updatedAt: Date | null | void
    isActive: boolean | null | void
    jiraSearchQueries: JsonArray | null | void
    cloudIds: stringArray | null | void
    scope: string | null | void
    accountId: string | null | void
    teamId: string | null | void
    userId: string | null | void
  }[]
}

/** 'InsertAtlassianAuthsQuery' return type */
export type IInsertAtlassianAuthsQueryResult = void

/** 'InsertAtlassianAuthsQuery' query type */
export interface IInsertAtlassianAuthsQueryQuery {
  params: IInsertAtlassianAuthsQueryParams
  result: IInsertAtlassianAuthsQueryResult
}

const insertAtlassianAuthsQueryIR: any = {
  name: 'insertAtlassianAuthsQuery',
  params: [
    {
      name: 'auths',
      codeRefs: {
        defined: {a: 46, b: 50, line: 3, col: 9},
        used: [{a: 367, b: 371, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'accessToken',
          'refreshToken',
          'createdAt',
          'updatedAt',
          'isActive',
          'jiraSearchQueries',
          'cloudIds',
          'scope',
          'accountId',
          'teamId',
          'userId'
        ]
      }
    }
  ],
  usedParamSet: {auths: true},
  statement: {
    body:
      'INSERT INTO "AtlassianAuth" ("accessToken", "refreshToken", "createdAt", "updatedAt", "isActive", "jiraSearchQueries", "cloudIds", "scope", "accountId", "teamId", "userId")\nVALUES :auths',
    loc: {a: 186, b: 371, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "AtlassianAuth" ("accessToken", "refreshToken", "createdAt", "updatedAt", "isActive", "jiraSearchQueries", "cloudIds", "scope", "accountId", "teamId", "userId")
 * VALUES :auths
 * ```
 */
export const insertAtlassianAuthsQuery = new PreparedQuery<
  IInsertAtlassianAuthsQueryParams,
  IInsertAtlassianAuthsQueryResult
>(insertAtlassianAuthsQueryIR)
