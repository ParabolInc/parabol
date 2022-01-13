/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderAuthStrategyEnum = 'oauth1' | 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'gitlab' | 'jiraServer' | 'mattermost';

/** 'UpsertIntegrationProviderQuery' parameters type */
export interface IUpsertIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  authStrategy: IntegrationProviderAuthStrategyEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  clientId: string | null | void;
  clientSecret: string | null | void;
  consumerKey: string | null | void;
  privateKey: string | null | void;
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

const upsertIntegrationProviderQueryIR: any = {"name":"upsertIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":276,"b":282,"line":19,"col":5}]}},{"name":"authStrategy","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":290,"b":301,"line":20,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":309,"b":313,"line":21,"col":5}]}},{"name":"clientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":321,"b":328,"line":22,"col":5}]}},{"name":"clientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":336,"b":347,"line":23,"col":5}]}},{"name":"consumerKey","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":355,"b":365,"line":24,"col":5}]}},{"name":"privateKey","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":373,"b":382,"line":25,"col":5}]}},{"name":"serverBaseUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":390,"b":402,"line":26,"col":5}]}},{"name":"webhookUrl","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":410,"b":419,"line":27,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":427,"b":432,"line":28,"col":5}]}}],"usedParamSet":{"service":true,"authStrategy":true,"scope":true,"clientId":true,"clientSecret":true,"consumerKey":true,"privateKey":true,"serverBaseUrl":true,"webhookUrl":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"service\",\n    \"authStrategy\",\n    \"scope\",\n    \"clientId\",\n    \"clientSecret\",\n    \"consumerKey\",\n    \"privateKey\",\n    \"serverBaseUrl\",\n    \"webhookUrl\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :service,\n    :authStrategy,\n    :scope,\n    :clientId,\n    :clientSecret,\n    :consumerKey,\n    :privateKey,\n    :serverBaseUrl,\n    :webhookUrl,\n    :teamId\n  )\nON CONFLICT (\"teamId\", \"service\", \"authStrategy\") DO UPDATE SET\n  \"service\" = EXCLUDED.\"service\",\n  \"authStrategy\" = EXCLUDED.\"authStrategy\",\n  \"scope\" = EXCLUDED.\"scope\",\n  \"clientId\" = EXCLUDED.\"clientId\",\n  \"clientSecret\" = EXCLUDED.\"clientSecret\",\n  \"consumerKey\" = EXCLUDED.\"consumerKey\",\n  \"privateKey\" = EXCLUDED.\"privateKey\",\n  \"serverBaseUrl\" = EXCLUDED.\"serverBaseUrl\",\n  \"webhookUrl\" = EXCLUDED.\"webhookUrl\",\n  \"updatedAt\" = CURRENT_TIMESTAMP,\n  \"isActive\" = TRUE\n\nRETURNING id","loc":{"a":45,"b":925,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationProvider" (
 *     "service",
 *     "authStrategy",
 *     "scope",
 *     "clientId",
 *     "clientSecret",
 *     "consumerKey",
 *     "privateKey",
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
 *     :clientSecret,
 *     :consumerKey,
 *     :privateKey,
 *     :serverBaseUrl,
 *     :webhookUrl,
 *     :teamId
 *   )
 * ON CONFLICT ("teamId", "service", "authStrategy") DO UPDATE SET
 *   "service" = EXCLUDED."service",
 *   "authStrategy" = EXCLUDED."authStrategy",
 *   "scope" = EXCLUDED."scope",
 *   "clientId" = EXCLUDED."clientId",
 *   "clientSecret" = EXCLUDED."clientSecret",
 *   "consumerKey" = EXCLUDED."consumerKey",
 *   "privateKey" = EXCLUDED."privateKey",
 *   "serverBaseUrl" = EXCLUDED."serverBaseUrl",
 *   "webhookUrl" = EXCLUDED."webhookUrl",
 *   "updatedAt" = CURRENT_TIMESTAMP,
 *   "isActive" = TRUE
 * 
 * RETURNING id
 * ```
 */
export const upsertIntegrationProviderQuery = new PreparedQuery<IUpsertIntegrationProviderQueryParams,IUpsertIntegrationProviderQueryResult>(upsertIntegrationProviderQueryIR);


