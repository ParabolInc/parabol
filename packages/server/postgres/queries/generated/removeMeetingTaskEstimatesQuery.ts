/** Types generated for queries found in "packages/server/postgres/queries/src/removeMeetingTaskEstimatesQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'RemoveMeetingTaskEstimatesQuery' parameters type */
export interface IRemoveMeetingTaskEstimatesQueryParams {
  meetingId: string | null | void
}

/** 'RemoveMeetingTaskEstimatesQuery' return type */
export type IRemoveMeetingTaskEstimatesQueryResult = void

/** 'RemoveMeetingTaskEstimatesQuery' query type */
export interface IRemoveMeetingTaskEstimatesQueryQuery {
  params: IRemoveMeetingTaskEstimatesQueryParams
  result: IRemoveMeetingTaskEstimatesQueryResult
}

const removeMeetingTaskEstimatesQueryIR: any = {
  name: 'removeMeetingTaskEstimatesQuery',
  params: [
    {
      name: 'meetingId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 94, b: 102, line: 5, col: 21}]}
    }
  ],
  usedParamSet: {meetingId: true},
  statement: {
    body: 'DELETE FROM "TaskEstimate"\nWHERE "meetingId" = :meetingId',
    loc: {a: 46, b: 102, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "TaskEstimate"
 * WHERE "meetingId" = :meetingId
 * ```
 */
export const removeMeetingTaskEstimatesQuery = new PreparedQuery<
  IRemoveMeetingTaskEstimatesQueryParams,
  IRemoveMeetingTaskEstimatesQueryResult
>(removeMeetingTaskEstimatesQueryIR)
