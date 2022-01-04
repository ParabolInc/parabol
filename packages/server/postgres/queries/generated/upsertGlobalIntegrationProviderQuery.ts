/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGlobalIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertGlobalIntegrationProviderQuery' parameters type */
export interface IUpsertGlobalIntegrationProviderQueryParams {
  service: IntegrationProviderServiceEnum | null | void;
  providerMetadata: Json | null | void;
}

/** 'UpsertGlobalIntegrationProviderQuery' return type */
export type IUpsertGlobalIntegrationProviderQueryResult = void;

/** 'UpsertGlobalIntegrationProviderQuery' query type */
export interface IUpsertGlobalIntegrationProviderQueryQuery {
  params: IUpsertGlobalIntegrationProviderQueryParams;
  result: IUpsertGlobalIntegrationProviderQueryResult;
}

const upsertGlobalIntegrationProviderQueryIR: any = {"name":"upsertGlobalIntegrationProviderQuery","params":[{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":173,"b":179,"line":14,"col":3}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":284,"b":299,"line":18,"col":3}]}}],"usedParamSet":{"service":true,"providerMetadata":true},"statement":{"body":"INSERT INTO\n\t\"IntegrationProvider\" (\n\t\t\"service\",\n\t\t\"type\",\n\t\t\"scope\",\n\t\t\"isActive\",\n\t\t\"providerMetadata\"\n\t)\nVALUES\n\t(\n\t\t:service,\n\t\t'oauth2' :: \"IntegrationProviderTypeEnum\",\n\t\t'global' :: \"IntegrationProviderScopeEnum\",\n\t\tTRUE,\n\t\t:providerMetadata\n\t) ON CONFLICT (\"scopeGlobal\", \"service\") DO\nUPDATE\nSET\n\t(\n\t\t\"service\",\n\t\t\"type\",\n\t\t\"scope\",\n\t\t\"isActive\",\n\t\t\"providerMetadata\",\n\t\t\"updatedAt\"\n\t) = (\n\t\tEXCLUDED.\"service\",\n\t\t'oauth2' :: \"IntegrationProviderTypeEnum\",\n\t\t'global' :: \"IntegrationProviderScopeEnum\",\n\t\tTRUE,\n\t\tEXCLUDED.\"providerMetadata\",\n\t\tCURRENT_TIMESTAMP\n\t)","loc":{"a":51,"b":624,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 * 	"IntegrationProvider" (
 * 		"service",
 * 		"type",
 * 		"scope",
 * 		"isActive",
 * 		"providerMetadata"
 * 	)
 * VALUES
 * 	(
 * 		:service,
 * 		'oauth2' :: "IntegrationProviderTypeEnum",
 * 		'global' :: "IntegrationProviderScopeEnum",
 * 		TRUE,
 * 		:providerMetadata
 * 	) ON CONFLICT ("scopeGlobal", "service") DO
 * UPDATE
 * SET
 * 	(
 * 		"service",
 * 		"type",
 * 		"scope",
 * 		"isActive",
 * 		"providerMetadata",
 * 		"updatedAt"
 * 	) = (
 * 		EXCLUDED."service",
 * 		'oauth2' :: "IntegrationProviderTypeEnum",
 * 		'global' :: "IntegrationProviderScopeEnum",
 * 		TRUE,
 * 		EXCLUDED."providerMetadata",
 * 		CURRENT_TIMESTAMP
 * 	)
 * ```
 */
export const upsertGlobalIntegrationProviderQuery = new PreparedQuery<IUpsertGlobalIntegrationProviderQueryParams,IUpsertGlobalIntegrationProviderQueryResult>(upsertGlobalIntegrationProviderQueryIR);


