/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetPollsByIdsQuery' parameters type */
export interface IGetPollsByIdsQueryParams {
  ids: readonly (number | null | void)[];
}

/** 'GetPollsByIdsQuery' return type */
export interface IGetPollsByIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  endedAt: Date | null;
  createdById: string;
  discussionId: string;
  teamId: string;
  threadSortOrder: number;
  meetingId: string | null;
  title: string | null;
}

/** 'GetPollsByIdsQuery' query type */
export interface IGetPollsByIdsQueryQuery {
  params: IGetPollsByIdsQueryParams;
  result: IGetPollsByIdsQueryResult;
}

const getPollsByIdsQueryIR: any = {"name":"getPollsByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":39,"b":41,"line":3,"col":9},"used":[{"a":89,"b":91,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT * FROM \"Poll\"\nWHERE id in :ids","loc":{"a":55,"b":91,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Poll"
 * WHERE id in :ids
 * ```
 */
export const getPollsByIdsQuery = new PreparedQuery<IGetPollsByIdsQueryParams,IGetPollsByIdsQueryResult>(getPollsByIdsQueryIR);


