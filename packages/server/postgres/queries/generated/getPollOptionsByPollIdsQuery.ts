/** Types generated for queries found in "packages/server/postgres/queries/src/getPollOptionsByPollIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetPollOptionsByPollIdsQuery' parameters type */
export interface IGetPollOptionsByPollIdsQueryParams {
  pollIds: readonly (number | null | void)[];
}

/** 'GetPollOptionsByPollIdsQuery' return type */
export interface IGetPollOptionsByPollIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  pollId: number;
  voteUserIds: stringArray;
  title: string | null;
}

/** 'GetPollOptionsByPollIdsQuery' query type */
export interface IGetPollOptionsByPollIdsQueryQuery {
  params: IGetPollOptionsByPollIdsQueryParams;
  result: IGetPollOptionsByPollIdsQueryResult;
}

const getPollOptionsByPollIdsQueryIR: any = {"name":"getPollOptionsByPollIdsQuery","params":[{"name":"pollIds","codeRefs":{"defined":{"a":49,"b":55,"line":3,"col":9},"used":[{"a":115,"b":121,"line":6,"col":19}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"pollIds":true},"statement":{"body":"SELECT * FROM \"PollOption\"\nWHERE \"pollId\" in :pollIds","loc":{"a":69,"b":121,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "PollOption"
 * WHERE "pollId" in :pollIds
 * ```
 */
export const getPollOptionsByPollIdsQuery = new PreparedQuery<IGetPollOptionsByPollIdsQueryParams,IGetPollOptionsByPollIdsQueryResult>(getPollOptionsByPollIdsQueryIR);


