/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertIntegrationProviderQuery' parameters type */
export interface IInsertIntegrationProviderQueryParams {
  provider: IntegrationProvidersEnum | null | void;
  type: IntegrationProviderTypesEnum | null | void;
  scope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  providerMetadata: Json | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'InsertIntegrationProviderQuery' return type */
export type IInsertIntegrationProviderQueryResult = void;

/** 'InsertIntegrationProviderQuery' query type */
export interface IInsertIntegrationProviderQueryQuery {
  params: IInsertIntegrationProviderQueryParams;
  result: IInsertIntegrationProviderQueryResult;
}

const insertIntegrationProviderQueryIR: any = {"name":"insertIntegrationProviderQuery","params":[{"name":"provider","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":206,"b":213,"line":16,"col":5}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":221,"b":224,"line":17,"col":5}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":232,"b":236,"line":18,"col":5}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":244,"b":247,"line":19,"col":5}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":255,"b":270,"line":20,"col":5}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":278,"b":282,"line":21,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":290,"b":295,"line":22,"col":5}]}}],"usedParamSet":{"provider":true,"type":true,"scope":true,"name":true,"providerMetadata":true,"orgId":true,"teamId":true},"statement":{"body":"INSERT INTO\n  \"IntegrationProvider\" (\n    \"provider\",\n    \"type\",\n    \"scope\",\n    \"name\",\n    \"providerMetadata\",\n    \"orgId\",\n    \"teamId\"\n  )\nVALUES\n  (\n    :provider,\n    :type,\n    :scope,\n    :name,\n    :providerMetadata,\n    :orgId,\n    :teamId\n  )","loc":{"a":45,"b":299,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationProvider" (
 *     "provider",
 *     "type",
 *     "scope",
 *     "name",
 *     "providerMetadata",
 *     "orgId",
 *     "teamId"
 *   )
 * VALUES
 *   (
 *     :provider,
 *     :type,
 *     :scope,
 *     :name,
 *     :providerMetadata,
 *     :orgId,
 *     :teamId
 *   )
 * ```
 */
export const insertIntegrationProviderQuery = new PreparedQuery<IInsertIntegrationProviderQueryParams,IInsertIntegrationProviderQueryResult>(insertIntegrationProviderQueryIR);


