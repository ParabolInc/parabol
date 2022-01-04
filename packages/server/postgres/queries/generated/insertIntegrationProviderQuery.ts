/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type IntegrationProviderTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertIntegrationProviderQuery' parameters type */
export interface IInsertIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  type: IntegrationProviderTypeEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  providerMetadata: Json | null | void;
  teamId: string | null | void;
}

/** 'InsertIntegrationProviderQuery' return type */
export interface IInsertIntegrationProviderQueryResult {
  id: number;
}

/** 'InsertIntegrationProviderQuery' query type */
export interface IInsertIntegrationProviderQueryQuery {
  params: IInsertIntegrationProviderQueryParams;
  result: IInsertIntegrationProviderQueryResult;
}

const insertIntegrationProviderQueryIR: any = {"name":"insertIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":186,"line":14,"col":5}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":194,"b":197,"line":15,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":205,"b":209,"line":16,"col":5}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":217,"b":232,"line":17,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":240,"b":245,"line":18,"col":5}]}}],"usedParamSet":{"service":true,"type":true,"scope":true,"providerMetadata":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"service\",\n    \"type\",\n    \"scope\",\n    \"providerMetadata\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :service,\n    :type,\n    :scope,\n    :providerMetadata,\n    :teamId\n  ) RETURNING id","loc":{"a":45,"b":262,"line":4,"col":0}}};

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
 *   ) RETURNING id
 * ```
 */
export const insertIntegrationProviderQuery = new PreparedQuery<IInsertIntegrationProviderQueryParams,IInsertIntegrationProviderQueryResult>(insertIntegrationProviderQueryIR);


