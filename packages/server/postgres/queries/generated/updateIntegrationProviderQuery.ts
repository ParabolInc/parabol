/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  ids: readonly (number | null | void)[];
  provider: IntegrationProvidersEnum | null | void;
  type: IntegrationProviderTypesEnum | null | void;
  scope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  providerMetadata: Json | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'UpdateIntegrationProviderQuery' return type */
export type IUpdateIntegrationProviderQueryResult = void;

/** 'UpdateIntegrationProviderQuery' query type */
export interface IUpdateIntegrationProviderQueryQuery {
  params: IUpdateIntegrationProviderQueryParams;
  result: IUpdateIntegrationProviderQueryResult;
}

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":49,"b":51,"line":3,"col":8},"used":[{"a":427,"b":429,"line":16,"col":9}]},"transform":{"type":"array_spread"}},{"name":"provider","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":126,"b":133,"line":8,"col":25}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":170,"b":173,"line":9,"col":21}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":207,"b":211,"line":10,"col":22}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":245,"b":248,"line":11,"col":21}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":293,"b":308,"line":12,"col":33}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":354,"b":358,"line":13,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":394,"b":399,"line":14,"col":23}]}}],"usedParamSet":{"provider":true,"type":true,"scope":true,"name":true,"providerMetadata":true,"orgId":true,"teamId":true,"ids":true},"statement":{"body":"UPDATE\n  \"IntegrationProvider\"\nSET\n  \"provider\" = COALESCE(:provider, \"provider\"),\n  \"type\" = COALESCE(:type, \"type\"),\n  \"scope\" = COALESCE(:scope, \"scope\"),\n  \"name\" = COALESCE(:name, \"name\"),\n  \"providerMetadata\" = COALESCE(:providerMetadata, \"providerMetadata\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"teamId\" = COALESCE(:teamId, \"teamId\")\nWHERE\n  id IN :ids","loc":{"a":66,"b":429,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   "IntegrationProvider"
 * SET
 *   "provider" = COALESCE(:provider, "provider"),
 *   "type" = COALESCE(:type, "type"),
 *   "scope" = COALESCE(:scope, "scope"),
 *   "name" = COALESCE(:name, "name"),
 *   "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "teamId" = COALESCE(:teamId, "teamId")
 * WHERE
 *   id IN :ids
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


