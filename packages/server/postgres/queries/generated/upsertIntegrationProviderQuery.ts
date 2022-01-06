/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type IntegrationProviderTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertIntegrationProviderQuery' parameters type */
export interface IUpsertIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  type: IntegrationProviderTypeEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  providerMetadata: Json | null | void;
  teamId: string | null | void;
}

/** 'UpsertIntegrationProviderQuery' return type */
export interface IUpsertIntegrationProviderQueryResult {
  id: number;
}

/** 'UpsertIntegrationProviderQuery' query type */
export interface IUpsertIntegrationProviderQueryQuery {
  params: IUpsertIntegrationProviderQueryParams;
  result: IUpsertIntegrationProviderQueryResult;
}

const upsertIntegrationProviderQueryIR: any = {"name":"upsertIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":186,"line":14,"col":5}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":194,"b":197,"line":15,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":205,"b":209,"line":16,"col":5}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":217,"b":232,"line":17,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":240,"b":245,"line":18,"col":5}]}}],"usedParamSet":{"service":true,"type":true,"scope":true,"providerMetadata":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"service\",\n    \"type\",\n    \"scope\",\n    \"providerMetadata\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :service,\n    :type,\n    :scope,\n    :providerMetadata,\n    :teamId\n  )\nON CONFLICT (\"teamId\", \"service\", \"type\") DO UPDATE SET\n  \"service\" = EXCLUDED.\"service\",\n  \"type\" = EXCLUDED.\"type\",\n  \"scope\" = EXCLUDED.\"scope\",\n  \"providerMetadata\" = EXCLUDED.\"providerMetadata\",\n  \"updatedAt\" = CURRENT_TIMESTAMP,\n  \"isActive\" = TRUE\n\nRETURNING id","loc":{"a":45,"b":518,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationProvider" (
 *     "service",
 *     "type",
 *     "scope",
 *     "providerMetadata",
 *     "teamId"
 *   )
 * VALUES
 *   (
 *     :service,
 *     :type,
 *     :scope,
 *     :providerMetadata,
 *     :teamId
 *   )
 * ON CONFLICT ("teamId", "service", "type") DO UPDATE SET
 *   "service" = EXCLUDED."service",
 *   "type" = EXCLUDED."type",
 *   "scope" = EXCLUDED."scope",
 *   "providerMetadata" = EXCLUDED."providerMetadata",
 *   "updatedAt" = CURRENT_TIMESTAMP,
 *   "isActive" = TRUE
 * 
 * RETURNING id
 * ```
 */
export const upsertIntegrationProviderQuery = new PreparedQuery<IUpsertIntegrationProviderQueryParams,IUpsertIntegrationProviderQueryResult>(upsertIntegrationProviderQueryIR);


