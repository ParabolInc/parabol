/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type stringArray = (string)[];

/** 'InsertIntegrationProviderQuery' parameters type */
export interface IInsertIntegrationProviderQueryParams {
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

/** 'InsertIntegrationProviderQuery' return type */
export type IInsertIntegrationProviderQueryResult = void;

/** 'InsertIntegrationProviderQuery' query type */
export interface IInsertIntegrationProviderQueryQuery {
  params: IInsertIntegrationProviderQueryParams;
  result: IInsertIntegrationProviderQueryResult;
}

const insertIntegrationProviderQueryIR: any = {"name":"insertIntegrationProviderQuery","params":[{"name":"providerType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":260,"b":271,"line":16,"col":3}]}},{"name":"providerTokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":277,"b":293,"line":17,"col":3}]}},{"name":"providerScope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":299,"b":311,"line":18,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":317,"b":320,"line":19,"col":3}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":326,"b":338,"line":20,"col":3}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":344,"b":356,"line":21,"col":3}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":362,"b":378,"line":22,"col":3}]}},{"name":"scopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":384,"b":389,"line":23,"col":3}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":395,"b":399,"line":24,"col":3}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":405,"b":410,"line":25,"col":3}]}}],"usedParamSet":{"providerType":true,"providerTokenType":true,"providerScope":true,"name":true,"serverBaseUri":true,"oauthClientId":true,"oauthClientSecret":true,"scopes":true,"orgId":true,"teamId":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"providerType\",\n  \"providerTokenType\",\n  \"providerScope\",\n  \"name\",\n  \"serverBaseUri\",\n  \"oauthClientId\",\n  \"oauthClientSecret\",\n  \"scopes\",\n  \"orgId\",\n  \"teamId\"\n) VALUES (\n  :providerType,\n  :providerTokenType,\n  :providerScope,\n  :name,\n  :serverBaseUri,\n  :oauthClientId,\n  :oauthClientSecret,\n  :scopes,\n  :orgId,\n  :teamId\n)","loc":{"a":45,"b":412,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "providerType",
 *   "providerTokenType",
 *   "providerScope",
 *   "name",
 *   "serverBaseUri",
 *   "oauthClientId",
 *   "oauthClientSecret",
 *   "scopes",
 *   "orgId",
 *   "teamId"
 * ) VALUES (
 *   :providerType,
 *   :providerTokenType,
 *   :providerScope,
 *   :name,
 *   :serverBaseUri,
 *   :oauthClientId,
 *   :oauthClientSecret,
 *   :scopes,
 *   :orgId,
 *   :teamId
 * )
 * ```
 */
export const insertIntegrationProviderQuery = new PreparedQuery<IInsertIntegrationProviderQueryParams,IInsertIntegrationProviderQueryResult>(insertIntegrationProviderQueryIR);


