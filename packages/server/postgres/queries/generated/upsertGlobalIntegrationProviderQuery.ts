/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGlobalIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type stringArray = (string)[];

/** 'UpsertGlobalIntegrationProviderQuery' parameters type */
export interface IUpsertGlobalIntegrationProviderQueryParams {
  providerType: IntegrationProvidersEnum | null | void;
  name: string | null | void;
  serverBaseUri: string | null | void;
  scopes: stringArray | null | void;
  oauthClientId: string | null | void;
  oauthClientSecret: string | null | void;
}

/** 'UpsertGlobalIntegrationProviderQuery' return type */
export type IUpsertGlobalIntegrationProviderQueryResult = void;

/** 'UpsertGlobalIntegrationProviderQuery' query type */
export interface IUpsertGlobalIntegrationProviderQueryQuery {
  params: IUpsertGlobalIntegrationProviderQueryParams;
  result: IUpsertGlobalIntegrationProviderQueryResult;
}

const upsertGlobalIntegrationProviderQueryIR: any = {"name":"upsertGlobalIntegrationProviderQuery","params":[{"name":"providerType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":252,"b":263,"line":15,"col":4}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":370,"b":373,"line":19,"col":3}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":379,"b":391,"line":20,"col":3}]}},{"name":"scopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":397,"b":402,"line":21,"col":3}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":408,"b":420,"line":22,"col":3}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":426,"b":442,"line":23,"col":3}]}}],"usedParamSet":{"providerType":true,"name":true,"serverBaseUri":true,"scopes":true,"oauthClientId":true,"oauthClientSecret":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"providerType\",\n\t\"providerTokenType\",\n\t\"providerScope\",\n\t\"isActive\",\n\t\"name\",\n\t\"serverBaseUri\",\n\t\"scopes\",\n\t\"oauthClientId\",\n\t\"oauthClientSecret\"\n  ) VALUES (\n\t  :providerType,\n\t\t'OAUTH2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t'GLOBAL'::\"IntegrationProviderScopesEnum\",\n\t\tTRUE,\n\t\t:name,\n\t\t:serverBaseUri,\n\t\t:scopes,\n\t\t:oauthClientId,\n\t\t:oauthClientSecret\n\t)\n\tON CONFLICT (\"providerScopeGlobal\", \"providerType\")\n  DO UPDATE\n    SET (\n\t\t  \"providerType\",\n\t\t  \"providerTokenType\",\n\t\t  \"providerScope\",\n\t\t\t\"isActive\",\n\t\t\t\"name\",\n\t\t\t\"serverBaseUri\",\n\t\t\t\"scopes\",\n\t\t\t\"oauthClientId\",\n\t\t\t\"oauthClientSecret\",\n\t\t\t\"updatedAt\") = (\n\t\t\tEXCLUDED.\"providerType\",\n\t\t  'OAUTH2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t  'GLOBAL'::\"IntegrationProviderScopesEnum\",\n\t\t\tTRUE,\n\t\t\tEXCLUDED.\"name\",\n\t\t\tEXCLUDED.\"serverBaseUri\",\n\t\t\tEXCLUDED.\"scopes\",\n\t\t\tEXCLUDED.\"oauthClientId\",\n\t\t\tEXCLUDED.\"oauthClientSecret\",\n\t\t\tCURRENT_TIMESTAMP\n\t\t)","loc":{"a":51,"b":1001,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "providerType",
 * 	"providerTokenType",
 * 	"providerScope",
 * 	"isActive",
 * 	"name",
 * 	"serverBaseUri",
 * 	"scopes",
 * 	"oauthClientId",
 * 	"oauthClientSecret"
 *   ) VALUES (
 * 	  :providerType,
 * 		'OAUTH2'::"IntegrationProviderTokenTypeEnum",
 * 		'GLOBAL'::"IntegrationProviderScopesEnum",
 * 		TRUE,
 * 		:name,
 * 		:serverBaseUri,
 * 		:scopes,
 * 		:oauthClientId,
 * 		:oauthClientSecret
 * 	)
 * 	ON CONFLICT ("providerScopeGlobal", "providerType")
 *   DO UPDATE
 *     SET (
 * 		  "providerType",
 * 		  "providerTokenType",
 * 		  "providerScope",
 * 			"isActive",
 * 			"name",
 * 			"serverBaseUri",
 * 			"scopes",
 * 			"oauthClientId",
 * 			"oauthClientSecret",
 * 			"updatedAt") = (
 * 			EXCLUDED."providerType",
 * 		  'OAUTH2'::"IntegrationProviderTokenTypeEnum",
 * 		  'GLOBAL'::"IntegrationProviderScopesEnum",
 * 			TRUE,
 * 			EXCLUDED."name",
 * 			EXCLUDED."serverBaseUri",
 * 			EXCLUDED."scopes",
 * 			EXCLUDED."oauthClientId",
 * 			EXCLUDED."oauthClientSecret",
 * 			CURRENT_TIMESTAMP
 * 		)
 * ```
 */
export const upsertGlobalIntegrationProviderQuery = new PreparedQuery<IUpsertGlobalIntegrationProviderQueryParams,IUpsertGlobalIntegrationProviderQueryResult>(upsertGlobalIntegrationProviderQueryIR);


