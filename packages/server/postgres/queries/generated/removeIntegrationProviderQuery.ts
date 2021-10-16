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

const removeIntegrationProviderQueryIR: any = {"name":"removeIntegrationProviderQuery","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":190,"b":191,"line":7,"col":35},{"a":316,"b":317,"line":11,"col":14}]}}],"usedParamSet":{"id":true},"statement":{"body":"WITH removedTokens AS (\n  UPDATE \"IntegrationToken\"\n  SET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\n  WHERE \"integrationProviderId\" = :id AND \"isActive\" = TRUE\n)\nUPDATE \"IntegrationProvider\"\nSET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\nWHERE \"id\" = :id AND \"isActive\" = TRUE","loc":{"a":45,"b":339,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH removedTokens AS (
 *   UPDATE "IntegrationToken"
 *   SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 *   WHERE "integrationProviderId" = :id AND "isActive" = TRUE
 * )
 * UPDATE "IntegrationProvider"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "id" = :id AND "isActive" = TRUE
 * ```
 */
export const removeIntegrationProviderQuery = new PreparedQuery<IRemoveIntegrationProviderQueryParams,IRemoveIntegrationProviderQueryResult>(removeIntegrationProviderQueryIR);


