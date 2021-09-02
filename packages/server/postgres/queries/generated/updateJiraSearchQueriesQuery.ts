/** Types generated for queries found in "packages/server/postgres/queries/src/updateJiraSearchQueriesQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'UpdateJiraSearchQueriesQuery' parameters type */
export interface IUpdateJiraSearchQueriesQueryParams {
  jiraSearchQueries: JsonArray | null | void;
  teamId: string | null | void;
  userId: string | null | void;
}

/** 'UpdateJiraSearchQueriesQuery' return type */
export type IUpdateJiraSearchQueriesQueryResult = void;

/** 'UpdateJiraSearchQueriesQuery' query type */
export interface IUpdateJiraSearchQueriesQueryQuery {
  params: IUpdateJiraSearchQueriesQueryParams;
  result: IUpdateJiraSearchQueriesQueryResult;
}

const updateJiraSearchQueriesQueryIR: any = {"name":"updateJiraSearchQueriesQuery","params":[{"name":"jiraSearchQueries","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":96,"b":112,"line":6,"col":25}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":132,"b":137,"line":7,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":155,"b":160,"line":7,"col":41}]}}],"usedParamSet":{"jiraSearchQueries":true,"teamId":true,"userId":true},"statement":{"body":"UPDATE \"AtlassianAuth\" SET\n  \"jiraSearchQueries\" = :jiraSearchQueries\nWHERE \"teamId\" = :teamId AND \"userId\" = :userId","loc":{"a":44,"b":160,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "AtlassianAuth" SET
 *   "jiraSearchQueries" = :jiraSearchQueries
 * WHERE "teamId" = :teamId AND "userId" = :userId
 * ```
 */
export const updateJiraSearchQueriesQuery = new PreparedQuery<IUpdateJiraSearchQueriesQueryParams,IUpdateJiraSearchQueriesQueryResult>(updateJiraSearchQueriesQueryIR);


