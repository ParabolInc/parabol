/** Types generated for queries found in "packages/server/postgres/queries/src/removeIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveIntegrationTokenQuery' parameters type */
export interface IRemoveIntegrationTokenQueryParams {
  providerId: number | null | void;
  teamId: string | null | void;
  userId: string | null | void;
}

/** 'RemoveIntegrationTokenQuery' return type */
export type IRemoveIntegrationTokenQueryResult = void;

/** 'RemoveIntegrationTokenQuery' query type */
export interface IRemoveIntegrationTokenQueryQuery {
  params: IRemoveIntegrationTokenQueryParams;
  result: IRemoveIntegrationTokenQueryResult;
}

const removeIntegrationTokenQueryIR: any = {"name":"removeIntegrationTokenQuery","params":[{"name":"providerId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":146,"b":155,"line":6,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":175,"b":180,"line":7,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":200,"b":205,"line":8,"col":18}]}}],"usedParamSet":{"providerId":true,"teamId":true,"userId":true},"statement":{"body":"UPDATE \"IntegrationToken\"\nSET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\nWHERE \"providerId\" = :providerId\n  AND \"teamId\" = :teamId\n  AND \"userId\" = :userId\n  AND \"isActive\" = TRUE","loc":{"a":42,"b":229,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "IntegrationToken"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "providerId" = :providerId
 *   AND "teamId" = :teamId
 *   AND "userId" = :userId
 *   AND "isActive" = TRUE
 * ```
 */
export const removeIntegrationTokenQuery = new PreparedQuery<IRemoveIntegrationTokenQueryParams,IRemoveIntegrationTokenQueryResult>(removeIntegrationTokenQueryIR);


