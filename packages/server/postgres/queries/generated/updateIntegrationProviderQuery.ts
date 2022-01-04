/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type IntegrationProviderTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  ids: readonly (number | null | void)[];
  service: IntegrationProviderServiceEnum | null | void;
  type: IntegrationProviderTypeEnum | null | void;
  scope: IntegrationProviderScopeEnum | null | void;
  providerMetadata: Json | null | void;
  teamId: string | null | void;
}

/** 'UpdateIntegrationProviderQuery' return type */
export type IUpdateIntegrationProviderQueryResult = void;

/** 'UpdateIntegrationProviderQuery' query type */
export interface IUpdateIntegrationProviderQueryQuery {
  params: IUpdateIntegrationProviderQueryParams;
  result: IUpdateIntegrationProviderQueryResult;
}

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":49,"b":51,"line":3,"col":8},"used":[{"a":349,"b":351,"line":14,"col":9}]},"transform":{"type":"array_spread"}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":125,"b":131,"line":8,"col":24}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":170,"line":9,"col":21}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":204,"b":208,"line":10,"col":22}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":254,"b":269,"line":11,"col":33}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":316,"b":321,"line":12,"col":23}]}}],"usedParamSet":{"service":true,"type":true,"scope":true,"providerMetadata":true,"teamId":true,"ids":true},"statement":{"body":"UPDATE\n  \"IntegrationProvider\"\nSET\n  \"service\" = COALESCE(:service, \"service\"),\n  \"type\" = COALESCE(:type, \"type\"),\n  \"scope\" = COALESCE(:scope, \"scope\"),\n  \"providerMetadata\" = COALESCE(:providerMetadata, \"providerMetadata\"),\n  \"teamId\" = COALESCE(:teamId, \"teamId\")\nWHERE\n  id IN :ids","loc":{"a":66,"b":351,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   "IntegrationProvider"
 * SET
 *   "service" = COALESCE(:service, "service"),
 *   "type" = COALESCE(:type, "type"),
 *   "scope" = COALESCE(:scope, "scope"),
 *   "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
 *   "teamId" = COALESCE(:teamId, "teamId")
 * WHERE
 *   id IN :ids
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


