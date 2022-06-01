/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderAuthStrategyEnum = 'oauth1' | 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams';

/** 'UpsertIntegrationProviderQuery' parameters type */
export interface IUpsertIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  authStrategy: IntegrationProviderAuthStrategyEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  clientId: string | null | void;
  tenantId: string | null | void;
  clientSecret: string | null | void;
  consumerKey: string | null | void;
  consumerSecret: string | null | void;
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

const upsertIntegrationProviderQueryIR: any = {"name":"upsertIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":296,"b":302,"line":20,"col":5}]}},{"name":"authStrategy","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":310,"b":321,"line":21,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":329,"b":333,"line":22,"col":5}]}},{"name":"clientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":341,"b":348,"line":23,"col":5}]}},{"name":"tenantId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":356,"b":363,"line":24,"col":5}]}},{"name":"clientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":371,"b":382,"line":25,"col":5}]}},{"name":"consumerKey","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":390,"b":400,"line":26,"col":5}]}},{"name":"consumerSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":408,"b":421,"line":27,"col":5}]}},{"name":"serverBaseUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":429,"b":441,"line":28,"col":5}]}},{"name":"webhookUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":449,"b":458,"line":29,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":466,"b":471,"line":30,"col":5}]}}],"usedParamSet":{"service":true,"authStrategy":true,"scope":true,"clientId":true,"tenantId":true,"clientSecret":true,"consumerKey":true,"consumerSecret":true,"serverBaseUrl":true,"webhookUrl":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"service\",\n    \"authStrategy\",\n    \"scope\",\n    \"clientId\",\n    \"tenantId\",\n    \"clientSecret\",\n    \"consumerKey\",\n    \"consumerSecret\",\n    \"serverBaseUrl\",\n    \"webhookUrl\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :service,\n    :authStrategy,\n    :scope,\n    :clientId,\n    :tenantId,\n    :clientSecret,\n    :consumerKey,\n    :consumerSecret,\n    :serverBaseUrl,\n    :webhookUrl,\n    :teamId\n  )\nON CONFLICT (\"teamId\", \"service\", \"authStrategy\") DO UPDATE SET\n  \"service\" = EXCLUDED.\"service\",\n  \"authStrategy\" = EXCLUDED.\"authStrategy\",\n  \"scope\" = EXCLUDED.\"scope\",\n  \"clientId\" = EXCLUDED.\"clientId\",\n  \"tenantId\" = EXCLUDED.\"tenantId\",\n  \"clientSecret\" = EXCLUDED.\"clientSecret\",\n  \"consumerKey\" = EXCLUDED.\"consumerKey\",\n  \"consumerSecret\" = EXCLUDED.\"consumerSecret\",\n  \"serverBaseUrl\" = EXCLUDED.\"serverBaseUrl\",\n  \"webhookUrl\" = EXCLUDED.\"webhookUrl\",\n  \"updatedAt\" = CURRENT_TIMESTAMP,\n  \"isActive\" = TRUE\n\nRETURNING id","loc":{"a":45,"b":1008,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationProvider" (
 *     "service",
 *     "authStrategy",
 *     "scope",
 *     "clientId",
 *     "tenantId",
 *     "clientSecret",
 *     "consumerKey",
 *     "consumerSecret",
 *     "serverBaseUrl",
 *     "webhookUrl",
 *     "teamId"
 *   )
 * VALUES
 *   (
 *     :service,
 *     :authStrategy,
 *     :scope,
 *     :clientId,
 *     :tenantId,
 *     :clientSecret,
 *     :consumerKey,
 *     :consumerSecret,
 *     :serverBaseUrl,
 *     :webhookUrl,
 *     :teamId
 *   )
 * ON CONFLICT ("teamId", "service", "authStrategy") DO UPDATE SET
 *   "service" = EXCLUDED."service",
 *   "authStrategy" = EXCLUDED."authStrategy",
 *   "scope" = EXCLUDED."scope",
 *   "clientId" = EXCLUDED."clientId",
 *   "tenantId" = EXCLUDED."tenantId",
 *   "clientSecret" = EXCLUDED."clientSecret",
 *   "consumerKey" = EXCLUDED."consumerKey",
 *   "consumerSecret" = EXCLUDED."consumerSecret",
 *   "serverBaseUrl" = EXCLUDED."serverBaseUrl",
 *   "webhookUrl" = EXCLUDED."webhookUrl",
 *   "updatedAt" = CURRENT_TIMESTAMP,
 *   "isActive" = TRUE
 * 
 * RETURNING id
 * ```
 */
export const upsertIntegrationProviderQuery = new PreparedQuery<IUpsertIntegrationProviderQueryParams,IUpsertIntegrationProviderQueryResult>(upsertIntegrationProviderQueryIR);


