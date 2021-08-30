/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamsByIdsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetTeamsByIdsQuery' parameters type */
export interface IGetTeamsByIdsQueryParams {
  ids: Array<string | null | void>
}

/** 'GetTeamsByIdsQuery' return type */
export interface IGetTeamsByIdsQueryResult {
  id: string
  name: string
  createdAt: Date
  createdBy: string | null
  isArchived: boolean
  isPaid: boolean
  jiraDimensionFields: JsonArray
  lastMeetingType: MeetingTypeEnum
  tier: TierEnum
  orgId: string
  isOnboardTeam: boolean
  updatedAt: Date
  lockMessageHTML: string | null
}

/** 'GetTeamsByIdsQuery' query type */
export interface IGetTeamsByIdsQueryQuery {
  params: IGetTeamsByIdsQueryParams
  result: IGetTeamsByIdsQueryResult
}

const getTeamsByIdsQueryIR: any = {
  name: 'getTeamsByIdsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 39, b: 41, line: 3, col: 9},
        used: [{a: 89, b: 91, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {body: 'SELECT * FROM "Team"\nWHERE id IN :ids', loc: {a: 55, b: 91, line: 5, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Team"
 * WHERE id IN :ids
 * ```
 */
export const getTeamsByIdsQuery = new PreparedQuery<
  IGetTeamsByIdsQueryParams,
  IGetTeamsByIdsQueryResult
>(getTeamsByIdsQueryIR)
