/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGlobalIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertGlobalIntegrationProviderQuery' parameters type */
export interface IUpsertGlobalIntegrationProviderQueryParams {
  provider: IntegrationProvidersEnum | null | void;
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

const upsertGlobalIntegrationProviderQueryIR: any = {"name":"upsertGlobalIntegrationProviderQuery","params":[{"name":"provider","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":184,"b":191,"line":15,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":298,"b":301,"line":19,"col":3}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":307,"b":322,"line":20,"col":3}]}}],"usedParamSet":{"provider":true,"name":true,"providerMetadata":true},"statement":{"body":"INSERT INTO\n\t\"IntegrationProvider\" (\n\t\t\"provider\",\n\t\t\"type\",\n\t\t\"scope\",\n\t\t\"isActive\",\n\t\t\"name\",\n\t\t\"providerMetadata\"\n\t)\nVALUES\n\t(\n\t\t:provider,\n\t\t'oauth2' :: \"IntegrationProviderTypesEnum\",\n\t\t'global' :: \"IntegrationProviderScopesEnum\",\n\t\tTRUE,\n\t\t:name,\n\t\t:providerMetadata\n\t) ON CONFLICT (\"scopeGlobal\", \"provider\") DO\nUPDATE\nSET\n\t(\n\t\t\"provider\",\n\t\t\"type\",\n\t\t\"scope\",\n\t\t\"isActive\",\n\t\t\"name\",\n\t\t\"providerMetadata\",\n\t\t\"updatedAt\"\n\t) = (\n\t\tEXCLUDED.\"provider\",\n\t\t'oauth2' :: \"IntegrationProviderTypesEnum\",\n\t\t'global' :: \"IntegrationProviderScopesEnum\",\n\t\tTRUE,\n\t\tEXCLUDED.\"name\",\n\t\tEXCLUDED.\"providerMetadata\",\n\t\tCURRENT_TIMESTAMP\n\t)","loc":{"a":51,"b":681,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 * 	"IntegrationProvider" (
 * 		"provider",
 * 		"type",
 * 		"scope",
 * 		"isActive",
 * 		"name",
 * 		"providerMetadata"
 * 	)
 * VALUES
 * 	(
 * 		:provider,
 * 		'oauth2' :: "IntegrationProviderTypesEnum",
 * 		'global' :: "IntegrationProviderScopesEnum",
 * 		TRUE,
 * 		:name,
 * 		:providerMetadata
 * 	) ON CONFLICT ("scopeGlobal", "provider") DO
 * UPDATE
 * SET
 * 	(
 * 		"provider",
 * 		"type",
 * 		"scope",
 * 		"isActive",
 * 		"name",
 * 		"providerMetadata",
 * 		"updatedAt"
 * 	) = (
 * 		EXCLUDED."provider",
 * 		'oauth2' :: "IntegrationProviderTypesEnum",
 * 		'global' :: "IntegrationProviderScopesEnum",
 * 		TRUE,
 * 		EXCLUDED."name",
 * 		EXCLUDED."providerMetadata",
 * 		CURRENT_TIMESTAMP
 * 	)
 * ```
 */
export const upsertGlobalIntegrationProviderQuery = new PreparedQuery<IUpsertGlobalIntegrationProviderQueryParams,IUpsertGlobalIntegrationProviderQueryResult>(upsertGlobalIntegrationProviderQueryIR);


