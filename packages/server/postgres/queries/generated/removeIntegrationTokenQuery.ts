/** Types generated for queries found in "packages/server/postgres/queries/src/removeIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

/** 'RemoveIntegrationTokenQuery' parameters type */
export interface IRemoveIntegrationTokenQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'RemoveIntegrationTokenQuery' return type */
export type IRemoveIntegrationTokenQueryResult = void;

/** 'RemoveIntegrationTokenQuery' query type */
export interface IRemoveIntegrationTokenQueryQuery {
  params: IRemoveIntegrationTokenQueryParams;
  result: IRemoveIntegrationTokenQueryResult;
}

const removeIntegrationTokenQueryIR: any = {"name":"removeIntegrationTokenQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":142,"b":147,"line":6,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":172,"line":7,"col":18}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":193,"b":199,"line":8,"col":19}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true},"statement":{"body":"UPDATE \"IntegrationToken\"\nSET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\nWHERE \"userId\" = :userId\n  AND \"teamId\" = :teamId\n  AND \"service\" = :service\n  AND \"isActive\" = TRUE","loc":{"a":42,"b":223,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "IntegrationToken"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "userId" = :userId
 *   AND "teamId" = :teamId
 *   AND "service" = :service
 *   AND "isActive" = TRUE
 * ```
 */
export const removeIntegrationTokenQuery = new PreparedQuery<IRemoveIntegrationTokenQueryParams,IRemoveIntegrationTokenQueryResult>(removeIntegrationTokenQueryIR);


