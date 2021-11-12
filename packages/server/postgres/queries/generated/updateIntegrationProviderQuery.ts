/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProviderTypesEnum = 'GITLAB' | 'MATTERMOST';

export type stringArray = (string)[];

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  ids: readonly (number | null | void)[];
  type: IntegrationProviderTypesEnum | null | void;
  tokenType: IntegrationProviderTokenTypeEnum | null | void;
  scope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  serverBaseUri: string | null | void;
  oauthClientId: string | null | void;
  oauthClientSecret: string | null | void;
  oauthScopes: stringArray | null | void;
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

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":51,"b":53,"line":3,"col":9},"used":[{"a":614,"b":616,"line":16,"col":14}]},"transform":{"type":"array_spread"}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":121,"b":124,"line":6,"col":21}]}},{"name":"tokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":162,"b":170,"line":7,"col":26}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":209,"b":213,"line":8,"col":22}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":247,"b":250,"line":9,"col":21}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":292,"b":304,"line":10,"col":30}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":355,"b":367,"line":11,"col":30}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":422,"b":438,"line":12,"col":34}]}},{"name":"oauthScopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":491,"b":501,"line":13,"col":28}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":542,"b":546,"line":14,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":582,"b":587,"line":15,"col":23}]}}],"usedParamSet":{"type":true,"tokenType":true,"scope":true,"name":true,"serverBaseUri":true,"oauthClientId":true,"oauthClientSecret":true,"oauthScopes":true,"orgId":true,"teamId":true,"ids":true},"statement":{"body":"UPDATE \"IntegrationProvider\" SET\n  \"type\" = COALESCE(:type, \"type\"),\n  \"tokenType\" = COALESCE(:tokenType, \"tokenType\"),\n  \"scope\" = COALESCE(:scope, \"scope\"),\n  \"name\" = COALESCE(:name, \"name\"),\n  \"serverBaseUri\" = COALESCE(:serverBaseUri, \"serverBaseUri\"),\n  \"oauthClientId\" = COALESCE(:oauthClientId, \"oauthClientId\"),\n  \"oauthClientSecret\" = COALESCE(:oauthClientSecret, \"oauthClientSecret\"),\n  \"oauthScopes\" = COALESCE(:oauthScopes, \"oauthScopes\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"teamId\" = COALESCE(:teamId, \"teamId\")\n WHERE id IN :ids","loc":{"a":67,"b":616,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "IntegrationProvider" SET
 *   "type" = COALESCE(:type, "type"),
 *   "tokenType" = COALESCE(:tokenType, "tokenType"),
 *   "scope" = COALESCE(:scope, "scope"),
 *   "name" = COALESCE(:name, "name"),
 *   "serverBaseUri" = COALESCE(:serverBaseUri, "serverBaseUri"),
 *   "oauthClientId" = COALESCE(:oauthClientId, "oauthClientId"),
 *   "oauthClientSecret" = COALESCE(:oauthClientSecret, "oauthClientSecret"),
 *   "oauthScopes" = COALESCE(:oauthScopes, "oauthScopes"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "teamId" = COALESCE(:teamId, "teamId")
 *  WHERE id IN :ids
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


