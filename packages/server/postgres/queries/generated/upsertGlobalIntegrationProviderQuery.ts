/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGlobalIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertGlobalIntegrationProviderQuery' parameters type */
export interface IUpsertGlobalIntegrationProviderQueryParams {
  type: IntegrationProviderTypesEnum | null | void;
  name: string | null | void;
  providerMetadata: Json | null | void;
}

/** 'UpsertGlobalIntegrationProviderQuery' return type */
export type IUpsertGlobalIntegrationProviderQueryResult = void;

/** 'UpsertGlobalIntegrationProviderQuery' query type */
export interface IUpsertGlobalIntegrationProviderQueryQuery {
  params: IUpsertGlobalIntegrationProviderQueryParams;
  result: IUpsertGlobalIntegrationProviderQueryResult;
}

const upsertGlobalIntegrationProviderQueryIR: any = {"name":"upsertGlobalIntegrationProviderQuery","params":[{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":183,"line":12,"col":4}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":290,"b":293,"line":16,"col":3}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":299,"b":314,"line":17,"col":3}]}}],"usedParamSet":{"type":true,"name":true,"providerMetadata":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"type\",\n\t\"tokenType\",\n\t\"scope\",\n\t\"isActive\",\n\t\"name\",\n\t\"providerMetadata\"\n  ) VALUES (\n\t  :type,\n\t\t'oauth2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t'global'::\"IntegrationProviderScopesEnum\",\n\t\tTRUE,\n\t\t:name,\n\t\t:providerMetadata\n\t)\n\tON CONFLICT (\"scopeGlobal\", \"type\")\n  DO UPDATE\n    SET (\n\t\t  \"type\",\n\t\t  \"tokenType\",\n\t\t  \"scope\",\n\t\t\t\"isActive\",\n\t\t\t\"name\",\n\t\t\t\"providerMetadata\",\n\t\t\t\"updatedAt\") = (\n\t\t\tEXCLUDED.\"type\",\n\t\t  'oauth2'::\"IntegrationProviderTokenTypeEnum\",\n\t\t  'global'::\"IntegrationProviderScopesEnum\",\n\t\t\tTRUE,\n\t\t\tEXCLUDED.\"name\",\n\t\t\tEXCLUDED.\"providerMetadata\",\n\t\t\tCURRENT_TIMESTAMP\n\t\t)","loc":{"a":51,"b":690,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "type",
 * 	"tokenType",
 * 	"scope",
 * 	"isActive",
 * 	"name",
 * 	"providerMetadata"
 *   ) VALUES (
 * 	  :type,
 * 		'oauth2'::"IntegrationProviderTokenTypeEnum",
 * 		'global'::"IntegrationProviderScopesEnum",
 * 		TRUE,
 * 		:name,
 * 		:providerMetadata
 * 	)
 * 	ON CONFLICT ("scopeGlobal", "type")
 *   DO UPDATE
 *     SET (
 * 		  "type",
 * 		  "tokenType",
 * 		  "scope",
 * 			"isActive",
 * 			"name",
 * 			"providerMetadata",
 * 			"updatedAt") = (
 * 			EXCLUDED."type",
 * 		  'oauth2'::"IntegrationProviderTokenTypeEnum",
 * 		  'global'::"IntegrationProviderScopesEnum",
 * 			TRUE,
 * 			EXCLUDED."name",
 * 			EXCLUDED."providerMetadata",
 * 			CURRENT_TIMESTAMP
 * 		)
 * ```
 */
export const upsertGlobalIntegrationProviderQuery = new PreparedQuery<IUpsertGlobalIntegrationProviderQueryParams,IUpsertGlobalIntegrationProviderQueryResult>(upsertGlobalIntegrationProviderQueryIR);


