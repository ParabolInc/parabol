/** Types generated for queries found in "packages/server/postgres/queries/src/removeAtlassianAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveAtlassianAuthQuery' parameters type */
export interface IRemoveAtlassianAuthQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'RemoveAtlassianAuthQuery' return type */
export type IRemoveAtlassianAuthQueryResult = void;

/** 'RemoveAtlassianAuthQuery' query type */
export interface IRemoveAtlassianAuthQueryQuery {
  params: IRemoveAtlassianAuthQueryParams;
  result: IRemoveAtlassianAuthQueryResult;
}

const removeAtlassianAuthQueryIR: any = {"name":"removeAtlassianAuthQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":103,"b":108,"line":6,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":126,"b":131,"line":6,"col":41}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"UPDATE \"AtlassianAuth\"\nSET \"isActive\" = FALSE\nWHERE \"userId\" = :userId AND \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":39,"b":153,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "AtlassianAuth"
 * SET "isActive" = FALSE
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const removeAtlassianAuthQuery = new PreparedQuery<IRemoveAtlassianAuthQueryParams,IRemoveAtlassianAuthQueryResult>(removeAtlassianAuthQueryIR);


