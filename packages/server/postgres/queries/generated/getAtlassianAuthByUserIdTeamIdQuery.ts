/** Types generated for queries found in "packages/server/postgres/queries/src/getAtlassianAuthByUserIdTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

export type stringArray = string[]

/** 'GetAtlassianAuthByUserIdTeamIdQuery' parameters type */
export interface IGetAtlassianAuthByUserIdTeamIdQueryParams {
  userId: string | null | void
  teamId: string | null | void
}

/** 'GetAtlassianAuthByUserIdTeamIdQuery' return type */
export interface IGetAtlassianAuthByUserIdTeamIdQueryResult {
  accessToken: string
  refreshToken: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  jiraSearchQueries: JsonArray
  cloudIds: stringArray
  scope: string
  accountId: string
  teamId: string
  userId: string
}

/** 'GetAtlassianAuthByUserIdTeamIdQuery' query type */
export interface IGetAtlassianAuthByUserIdTeamIdQueryQuery {
  params: IGetAtlassianAuthByUserIdTeamIdQueryParams
  result: IGetAtlassianAuthByUserIdTeamIdQueryResult
}

const getAtlassianAuthByUserIdTeamIdQueryIR: any = {
  name: 'getAtlassianAuthByUserIdTeamIdQuery',
  params: [
    {
      name: 'userId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 98, b: 103, line: 5, col: 18}]}
    },
    {
      name: 'teamId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 121, b: 126, line: 5, col: 41}]}
    }
  ],
  usedParamSet: {userId: true, teamId: true},
  statement: {
    body:
      'SELECT * from "AtlassianAuth"\nWHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE',
    loc: {a: 50, b: 148, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AtlassianAuth"
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getAtlassianAuthByUserIdTeamIdQuery = new PreparedQuery<
  IGetAtlassianAuthByUserIdTeamIdQueryParams,
  IGetAtlassianAuthByUserIdTeamIdQueryResult
>(getAtlassianAuthByUserIdTeamIdQueryIR)
