/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type stringArray = (string)[];

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  ids: readonly (number | null | void)[];
  providerType: IntegrationProvidersEnum | null | void;
  providerTokenType: IntegrationProviderTokenTypeEnum | null | void;
  providerScope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  serverBaseUri: string | null | void;
  oauthClientId: string | null | void;
  oauthClientSecret: string | null | void;
  scopes: stringArray | null | void;
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

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":51,"b":53,"line":3,"col":9},"used":[{"a":671,"b":673,"line":16,"col":14}]},"transform":{"type":"array_spread"}},{"name":"providerType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":129,"b":140,"line":6,"col":29}]}},{"name":"providerTokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":194,"b":210,"line":7,"col":34}]}},{"name":"providerScope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":265,"b":277,"line":8,"col":30}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":319,"b":322,"line":9,"col":21}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":364,"b":376,"line":10,"col":30}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":427,"b":439,"line":11,"col":30}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":494,"b":510,"line":12,"col":34}]}},{"name":"scopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":558,"b":563,"line":13,"col":23}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":599,"b":603,"line":14,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":639,"b":644,"line":15,"col":23}]}}],"usedParamSet":{"providerType":true,"providerTokenType":true,"providerScope":true,"name":true,"serverBaseUri":true,"oauthClientId":true,"oauthClientSecret":true,"scopes":true,"orgId":true,"teamId":true,"ids":true},"statement":{"body":"UPDATE \"IntegrationProvider\" SET\n  \"providerType\" = COALESCE(:providerType, \"providerType\"),\n  \"providerTokenType\" = COALESCE(:providerTokenType, \"providerTokenType\"),\n  \"providerScope\" = COALESCE(:providerScope, \"providerScope\"),\n  \"name\" = COALESCE(:name, \"name\"),\n  \"serverBaseUri\" = COALESCE(:serverBaseUri, \"serverBaseUri\"),\n  \"oauthClientId\" = COALESCE(:oauthClientId, \"oauthClientId\"),\n  \"oauthClientSecret\" = COALESCE(:oauthClientSecret, \"oauthClientSecret\"),\n  \"scopes\" = COALESCE(:scopes, \"scopes\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"teamId\" = COALESCE(:teamId, \"teamId\")\n WHERE id IN :ids","loc":{"a":67,"b":673,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "IntegrationProvider" SET
 *   "providerType" = COALESCE(:providerType, "providerType"),
 *   "providerTokenType" = COALESCE(:providerTokenType, "providerTokenType"),
 *   "providerScope" = COALESCE(:providerScope, "providerScope"),
 *   "name" = COALESCE(:name, "name"),
 *   "serverBaseUri" = COALESCE(:serverBaseUri, "serverBaseUri"),
 *   "oauthClientId" = COALESCE(:oauthClientId, "oauthClientId"),
 *   "oauthClientSecret" = COALESCE(:oauthClientSecret, "oauthClientSecret"),
 *   "scopes" = COALESCE(:scopes, "scopes"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "teamId" = COALESCE(:teamId, "teamId")
 *  WHERE id IN :ids
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


