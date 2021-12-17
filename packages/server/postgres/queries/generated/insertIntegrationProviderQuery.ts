/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertIntegrationProviderQuery' parameters type */
export interface IInsertIntegrationProviderQueryParams {
  type: IntegrationProviderTypesEnum | null | void;
  tokenType: IntegrationProviderTokenTypeEnum | null | void;
  scope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  providerMetadata: Json | null | void;
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

const insertIntegrationProviderQueryIR: any = {"name":"insertIntegrationProviderQuery","params":[{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":185,"b":188,"line":13,"col":3}]}},{"name":"tokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":194,"b":202,"line":14,"col":3}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":208,"b":212,"line":15,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":218,"b":221,"line":16,"col":3}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":227,"b":242,"line":17,"col":3}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":248,"b":252,"line":18,"col":3}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":258,"b":263,"line":19,"col":3}]}}],"usedParamSet":{"type":true,"tokenType":true,"scope":true,"name":true,"providerMetadata":true,"orgId":true,"teamId":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"type\",\n  \"tokenType\",\n  \"scope\",\n  \"name\",\n  \"providerMetadata\",\n  \"orgId\",\n  \"teamId\"\n) VALUES (\n  :type,\n  :tokenType,\n  :scope,\n  :name,\n  :providerMetadata,\n  :orgId,\n  :teamId\n)","loc":{"a":45,"b":265,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "type",
 *   "tokenType",
 *   "scope",
 *   "name",
 *   "providerMetadata",
 *   "orgId",
 *   "teamId"
 * ) VALUES (
 *   :type,
 *   :tokenType,
 *   :scope,
 *   :name,
 *   :providerMetadata,
 *   :orgId,
 *   :teamId
 * )
 * ```
 */
export const insertIntegrationProviderQuery = new PreparedQuery<IInsertIntegrationProviderQueryParams,IInsertIntegrationProviderQueryResult>(insertIntegrationProviderQueryIR);


