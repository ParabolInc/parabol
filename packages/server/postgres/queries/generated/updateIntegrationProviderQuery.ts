/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  ids: readonly (number | null | void)[];
  type: IntegrationProviderTypesEnum | null | void;
  tokenType: IntegrationProviderTokenTypeEnum | null | void;
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

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":51,"b":53,"line":3,"col":9},"used":[{"a":428,"b":430,"line":13,"col":14}]},"transform":{"type":"array_spread"}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":121,"b":124,"line":6,"col":21}]}},{"name":"tokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":162,"b":170,"line":7,"col":26}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":209,"b":213,"line":8,"col":22}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":247,"b":250,"line":9,"col":21}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":295,"b":310,"line":10,"col":33}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":356,"b":360,"line":11,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":396,"b":401,"line":12,"col":23}]}}],"usedParamSet":{"type":true,"tokenType":true,"scope":true,"name":true,"providerMetadata":true,"orgId":true,"teamId":true,"ids":true},"statement":{"body":"UPDATE \"IntegrationProvider\" SET\n  \"type\" = COALESCE(:type, \"type\"),\n  \"tokenType\" = COALESCE(:tokenType, \"tokenType\"),\n  \"scope\" = COALESCE(:scope, \"scope\"),\n  \"name\" = COALESCE(:name, \"name\"),\n  \"providerMetadata\" = COALESCE(:providerMetadata, \"providerMetadata\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"teamId\" = COALESCE(:teamId, \"teamId\")\n WHERE id IN :ids","loc":{"a":67,"b":430,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "IntegrationProvider" SET
 *   "type" = COALESCE(:type, "type"),
 *   "tokenType" = COALESCE(:tokenType, "tokenType"),
 *   "scope" = COALESCE(:scope, "scope"),
 *   "name" = COALESCE(:name, "name"),
 *   "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "teamId" = COALESCE(:teamId, "teamId")
 *  WHERE id IN :ids
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


