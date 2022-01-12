/** Types generated for queries found in "packages/server/postgres/queries/src/getUserIdsToPauseQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetUserIdsToPauseQuery' parameters type */
export interface IGetUserIdsToPauseQueryParams {
  activeThreshold: Date | null | void;
}

/** 'GetUserIdsToPauseQuery' return type */
export interface IGetUserIdsToPauseQueryResult {
  id: string;
}

/** 'GetUserIdsToPauseQuery' query type */
export interface IGetUserIdsToPauseQueryQuery {
  params: IGetUserIdsToPauseQueryParams;
  result: IGetUserIdsToPauseQueryResult;
}

const getUserIdsToPauseQueryIR: any = {"name":"getUserIdsToPauseQuery","params":[{"name":"activeThreshold","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":103,"b":117,"line":5,"col":44}]}}],"usedParamSet":{"activeThreshold":true},"statement":{"body":"SELECT id FROM \"User\"\nWHERE inactive = false AND \"lastSeenAt\" <= :activeThreshold","loc":{"a":37,"b":117,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id FROM "User"
 * WHERE inactive = false AND "lastSeenAt" <= :activeThreshold
 * ```
 */
export const getUserIdsToPauseQuery = new PreparedQuery<IGetUserIdsToPauseQueryParams,IGetUserIdsToPauseQueryResult>(getUserIdsToPauseQueryIR);


