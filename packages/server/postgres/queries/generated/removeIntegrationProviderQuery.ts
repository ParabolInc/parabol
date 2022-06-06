/** Types generated for queries found in "packages/server/postgres/queries/src/removeIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveIntegrationProviderQuery' parameters type */
export interface IRemoveIntegrationProviderQueryParams {
  id: number | null | void;
}

/** 'RemoveIntegrationProviderQuery' return type */
export type IRemoveIntegrationProviderQueryResult = void;

/** 'RemoveIntegrationProviderQuery' query type */
export interface IRemoveIntegrationProviderQueryQuery {
  params: IRemoveIntegrationProviderQueryParams;
  result: IRemoveIntegrationProviderQueryResult;
}

const removeIntegrationProviderQueryIR: any = {"name":"removeIntegrationProviderQuery","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":155,"b":156,"line":7,"col":24},{"a":248,"b":249,"line":11,"col":14}]}}],"usedParamSet":{"id":true},"statement":{"body":"WITH removedTokens AS (\n  UPDATE \"TeamMemberIntegrationAuth\"\n  SET \"isActive\" = FALSE\n  WHERE \"providerId\" = :id AND \"isActive\" = TRUE\n)\nUPDATE \"IntegrationProvider\"\nSET \"isActive\" = FALSE\nWHERE \"id\" = :id AND \"isActive\" = TRUE","loc":{"a":45,"b":271,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH removedTokens AS (
 *   UPDATE "TeamMemberIntegrationAuth"
 *   SET "isActive" = FALSE
 *   WHERE "providerId" = :id AND "isActive" = TRUE
 * )
 * UPDATE "IntegrationProvider"
 * SET "isActive" = FALSE
 * WHERE "id" = :id AND "isActive" = TRUE
 * ```
 */
export const removeIntegrationProviderQuery = new PreparedQuery<IRemoveIntegrationProviderQueryParams,IRemoveIntegrationProviderQueryResult>(removeIntegrationProviderQueryIR);


