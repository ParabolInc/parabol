/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type IntegrationProviderTypeEnum = 'oauth2' | 'pat' | 'webhook';

/** 'UpsertIntegrationProviderQuery' parameters type */
export interface IUpsertIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  type: IntegrationProviderTypeEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  clientId: string | null | void;
  clientSecret: string | null | void;
  serverBaseUrl: string | null | void;
  webhookUrl: string | null | void;
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

const upsertIntegrationProviderQueryIR: any = {"name":"upsertIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":231,"b":237,"line":17,"col":5}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":245,"b":248,"line":18,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":256,"b":260,"line":19,"col":5}]}},{"name":"clientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":268,"b":275,"line":20,"col":5}]}},{"name":"clientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":283,"b":294,"line":21,"col":5}]}},{"name":"serverBaseUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":302,"b":314,"line":22,"col":5}]}},{"name":"webhookUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":322,"b":331,"line":23,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":339,"b":344,"line":24,"col":5}]}}],"usedParamSet":{"service":true,"type":true,"scope":true,"clientId":true,"clientSecret":true,"serverBaseUrl":true,"webhookUrl":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"service\",\n    \"type\",\n    \"scope\",\n    \"clientId\",\n    \"clientSecret\",\n    \"serverBaseUrl\",\n    \"webhookUrl\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :service,\n    :type,\n    :scope,\n    :clientId,\n    :clientSecret,\n    :serverBaseUrl,\n    :webhookUrl,\n    :teamId\n  )\nON CONFLICT (\"teamId\", \"service\", \"type\") DO UPDATE SET\n  \"service\" = EXCLUDED.\"service\",\n  \"type\" = EXCLUDED.\"type\",\n  \"scope\" = EXCLUDED.\"scope\",\n  \"clientId\" = EXCLUDED.\"clientId\",\n  \"clientSecret\" = EXCLUDED.\"clientSecret\",\n  \"serverBaseUrl\" = EXCLUDED.\"serverBaseUrl\",\n  \"webhookUrl\" = EXCLUDED.\"webhookUrl\",\n  \"updatedAt\" = CURRENT_TIMESTAMP,\n  \"isActive\" = TRUE\n\nRETURNING id","loc":{"a":45,"b":731,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationProvider" (
 *     "service",
 *     "type",
 *     "scope",
 *     "clientId",
 *     "clientSecret",
 *     "serverBaseUrl",
 *     "webhookUrl",
 *     "teamId"
 *   )
 * VALUES
 *   (
 *     :service,
 *     :type,
 *     :scope,
 *     :clientId,
 *     :clientSecret,
 *     :serverBaseUrl,
 *     :webhookUrl,
 *     :teamId
 *   )
 * ON CONFLICT ("teamId", "service", "type") DO UPDATE SET
 *   "service" = EXCLUDED."service",
 *   "type" = EXCLUDED."type",
 *   "scope" = EXCLUDED."scope",
 *   "clientId" = EXCLUDED."clientId",
 *   "clientSecret" = EXCLUDED."clientSecret",
 *   "serverBaseUrl" = EXCLUDED."serverBaseUrl",
 *   "webhookUrl" = EXCLUDED."webhookUrl",
 *   "updatedAt" = CURRENT_TIMESTAMP,
 *   "isActive" = TRUE
 * 
 * RETURNING id
 * ```
 */
export const upsertIntegrationProviderQuery = new PreparedQuery<IUpsertIntegrationProviderQueryParams,IUpsertIntegrationProviderQueryResult>(upsertIntegrationProviderQueryIR);


