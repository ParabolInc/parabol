/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGlobalIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type stringArray = (string)[];

/** 'UpsertGlobalIntegrationProviderQuery' parameters type */
export interface IUpsertGlobalIntegrationProviderQueryParams {
  type: IntegrationProviderTypesEnum | null | void;
  name: string | null | void;
  serverBaseUri: string | null | void;
  oauthScopes: stringArray | null | void;
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

const upsertGlobalIntegrationProviderQueryIR: any = {"name":"upsertGlobalIntegrationProviderQuery","params":[{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":233,"b":236,"line":15,"col":4}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":343,"b":346,"line":19,"col":3}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":352,"b":364,"line":20,"col":3}]}},{"name":"oauthScopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":370,"b":380,"line":21,"col":3}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":386,"b":398,"line":22,"col":3}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":404,"b":420,"line":23,"col":3}]}}],"usedParamSet":{"type":true,"name":true,"serverBaseUri":true,"oauthScopes":true,"oauthClientId":true,"oauthClientSecret":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"type\",\n\t\"tokenType\",\n\t\"scope\",\n\t\"isActive\",\n\t\"name\",\n\t\"serverBaseUri\",\n\t\"oauthScopes\",\n\t\"oauthClientId\",\n\t\"oauthClientSecret\"\n  ) VALUES (\n\t  :type,\n\t\t'oauth2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t'global'::\"IntegrationProviderScopesEnum\",\n\t\tTRUE,\n\t\t:name,\n\t\t:serverBaseUri,\n\t\t:oauthScopes,\n\t\t:oauthClientId,\n\t\t:oauthClientSecret\n\t)\n\tON CONFLICT (\"scopeGlobal\", \"type\")\n  DO UPDATE\n    SET (\n\t\t  \"type\",\n\t\t  \"tokenType\",\n\t\t  \"scope\",\n\t\t\t\"isActive\",\n\t\t\t\"name\",\n\t\t\t\"serverBaseUri\",\n\t\t\t\"oauthScopes\",\n\t\t\t\"oauthClientId\",\n\t\t\t\"oauthClientSecret\",\n\t\t\t\"updatedAt\") = (\n\t\t\tEXCLUDED.\"type\",\n\t\t  'oauth2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t  'global'::\"IntegrationProviderScopesEnum\",\n\t\t\tTRUE,\n\t\t\tEXCLUDED.\"name\",\n\t\t\tEXCLUDED.\"serverBaseUri\",\n\t\t\tEXCLUDED.\"oauthScopes\",\n\t\t\tEXCLUDED.\"oauthClientId\",\n\t\t\tEXCLUDED.\"oauthClientSecret\",\n\t\t\tCURRENT_TIMESTAMP\n\t\t)","loc":{"a":51,"b":941,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "type",
 * 	"tokenType",
 * 	"scope",
 * 	"isActive",
 * 	"name",
 * 	"serverBaseUri",
 * 	"oauthScopes",
 * 	"oauthClientId",
 * 	"oauthClientSecret"
 *   ) VALUES (
 * 	  :type,
 * 		'oauth2'::"IntegrationProviderTokenTypeEnum",
 * 		'global'::"IntegrationProviderScopesEnum",
 * 		TRUE,
 * 		:name,
 * 		:serverBaseUri,
 * 		:oauthScopes,
 * 		:oauthClientId,
 * 		:oauthClientSecret
 * 	)
 * 	ON CONFLICT ("scopeGlobal", "type")
 *   DO UPDATE
 *     SET (
 * 		  "type",
 * 		  "tokenType",
 * 		  "scope",
 * 			"isActive",
 * 			"name",
 * 			"serverBaseUri",
 * 			"oauthScopes",
 * 			"oauthClientId",
 * 			"oauthClientSecret",
 * 			"updatedAt") = (
 * 			EXCLUDED."type",
 * 		  'oauth2'::"IntegrationProviderTokenTypeEnum",
 * 		  'global'::"IntegrationProviderScopesEnum",
 * 			TRUE,
 * 			EXCLUDED."name",
 * 			EXCLUDED."serverBaseUri",
 * 			EXCLUDED."oauthScopes",
 * 			EXCLUDED."oauthClientId",
 * 			EXCLUDED."oauthClientSecret",
 * 			CURRENT_TIMESTAMP
 * 		)
 * ```
 */
export const upsertGlobalIntegrationProviderQuery = new PreparedQuery<IUpsertGlobalIntegrationProviderQueryParams,IUpsertGlobalIntegrationProviderQueryResult>(upsertGlobalIntegrationProviderQueryIR);


