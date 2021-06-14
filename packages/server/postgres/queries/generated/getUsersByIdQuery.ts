/** Types generated for queries found in "packages/server/postgres/queries/src/getUsersByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type AuthTokenRole = 'su'

export type stringArray = string[]

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetUsersByIdQuery' parameters type */
export interface IGetUsersByIdQueryParams {
  ids: Array<string | null | void>
}

/** 'GetUsersByIdQuery' return type */
export interface IGetUsersByIdQueryResult {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  inactive: boolean
  lastSeenAt: Date | null
  preferredName: string
  tier: TierEnum
  picture: string
  tms: stringArray
  featureFlags: stringArray
  identities: JsonArray
  lastSeenAtURLs: stringArray | null
  segmentId: string | null
  newFeatureId: string | null
  overLimitCopy: string | null
  isRemoved: boolean
  reasonRemoved: string | null
  rol: AuthTokenRole | null
  payLaterClickCount: number
  eqChecked: Date
}

/** 'GetUsersByIdQuery' query type */
export interface IGetUsersByIdQueryQuery {
  params: IGetUsersByIdQueryParams
  result: IGetUsersByIdQueryResult
}

const getUsersByIdQueryIR: any = {
  name: 'getUsersByIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 38, b: 40, line: 3, col: 9},
        used: [{a: 88, b: 90, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {body: 'SELECT * FROM "User"\nWHERE id in :ids', loc: {a: 54, b: 90, line: 5, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "User"
 * WHERE id in :ids
 * ```
 */
export const getUsersByIdQuery = new PreparedQuery<
  IGetUsersByIdQueryParams,
  IGetUsersByIdQueryResult
>(getUsersByIdQueryIR)
