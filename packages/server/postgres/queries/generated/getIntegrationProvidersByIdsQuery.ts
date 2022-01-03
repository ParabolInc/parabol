/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetIntegrationProvidersByIdsQuery' parameters type */
export interface IGetIntegrationProvidersByIdsQueryParams {
  ids: readonly (number | null | void)[];
}

/** 'GetIntegrationProvidersByIdsQuery' return type */
export interface IGetIntegrationProvidersByIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  provider: IntegrationProvidersEnum;
  type: IntegrationProviderTypesEnum;
  scope: IntegrationProviderScopesEnum;
  scopeGlobal: boolean | null;
  orgId: string | null;
  teamId: string | null;
  isActive: boolean;
  name: string;
  providerMetadata: Json;
}

/** 'GetIntegrationProvidersByIdsQuery' query type */
export interface IGetIntegrationProvidersByIdsQueryQuery {
  params: IGetIntegrationProvidersByIdsQueryParams;
  result: IGetIntegrationProvidersByIdsQueryResult;
}

const getIntegrationProvidersByIdsQueryIR: any = {"name":"getIntegrationProvidersByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":52,"b":54,"line":3,"col":8},"used":[{"a":124,"b":126,"line":10,"col":9}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT\n  *\nFROM\n  \"IntegrationProvider\"\nWHERE\n  id in :ids","loc":{"a":69,"b":126,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   *
 * FROM
 *   "IntegrationProvider"
 * WHERE
 *   id in :ids
 * ```
 */
export const getIntegrationProvidersByIdsQuery = new PreparedQuery<IGetIntegrationProvidersByIdsQueryParams,IGetIntegrationProvidersByIdsQueryResult>(getIntegrationProvidersByIdsQueryIR);


