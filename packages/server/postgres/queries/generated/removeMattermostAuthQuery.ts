/** Types generated for queries found in "packages/server/postgres/queries/src/removeMattermostAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveMattermostAuthQuery' parameters type */
export interface IRemoveMattermostAuthQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'RemoveMattermostAuthQuery' return type */
export type IRemoveMattermostAuthQueryResult = void;

/** 'RemoveMattermostAuthQuery' query type */
export interface IRemoveMattermostAuthQueryQuery {
  params: IRemoveMattermostAuthQueryParams;
  result: IRemoveMattermostAuthQueryResult;
}

const removeMattermostAuthQueryIR: any = {"name":"removeMattermostAuthQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":138,"b":143,"line":6,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":161,"b":166,"line":6,"col":41}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"UPDATE \"MattermostAuth\"\nSET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\nWHERE \"userId\" = :userId AND \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":40,"b":188,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "MattermostAuth"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const removeMattermostAuthQuery = new PreparedQuery<IRemoveMattermostAuthQueryParams,IRemoveMattermostAuthQueryResult>(removeMattermostAuthQueryIR);


