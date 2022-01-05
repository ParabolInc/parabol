/** Types generated for queries found in "packages/server/postgres/queries/src/updateIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateIntegrationProviderQuery' parameters type */
export interface IUpdateIntegrationProviderQueryParams {
  scope: IntegrationProviderScopeEnum | null | void;
  providerMetadata: Json | null | void;
  id: number | null | void;
}

/** 'UpdateIntegrationProviderQuery' return type */
export type IUpdateIntegrationProviderQueryResult = void;

/** 'UpdateIntegrationProviderQuery' query type */
export interface IUpdateIntegrationProviderQueryQuery {
  params: IUpdateIntegrationProviderQueryParams;
  result: IUpdateIntegrationProviderQueryResult;
}

const updateIntegrationProviderQueryIR: any = {"name":"updateIntegrationProviderQuery","params":[{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":102,"b":106,"line":7,"col":22}]}},{"name":"providerMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":152,"b":167,"line":8,"col":33}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":204,"b":205,"line":10,"col":8}]}}],"usedParamSet":{"scope":true,"providerMetadata":true,"id":true},"statement":{"body":"UPDATE\n  \"IntegrationProvider\"\nSET\n  \"scope\" = COALESCE(:scope, \"scope\"),\n  \"providerMetadata\" = COALESCE(:providerMetadata, \"providerMetadata\")\nWHERE\n  id = :id","loc":{"a":45,"b":205,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   "IntegrationProvider"
 * SET
 *   "scope" = COALESCE(:scope, "scope"),
 *   "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata")
 * WHERE
 *   id = :id
 * ```
 */
export const updateIntegrationProviderQuery = new PreparedQuery<IUpdateIntegrationProviderQueryParams,IUpdateIntegrationProviderQueryResult>(updateIntegrationProviderQueryIR);


