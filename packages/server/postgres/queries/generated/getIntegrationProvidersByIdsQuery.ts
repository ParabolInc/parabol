/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderAuthStrategyEnum = 'oauth1' | 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

/** 'GetIntegrationProvidersByIdsQuery' parameters type */
export interface IGetIntegrationProvidersByIdsQueryParams {
  ids: readonly (number | null | void)[];
}

/** 'GetIntegrationProvidersByIdsQuery' return type */
export interface IGetIntegrationProvidersByIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  service: IntegrationProviderServiceEnum;
  authStrategy: IntegrationProviderAuthStrategyEnum;
  scope: IntegrationProviderScopeEnum;
  scopeGlobal: boolean;
  teamId: string;
  isActive: boolean;
  clientId: string | null;
  clientSecret: string | null;
  serverBaseUrl: string | null;
  webhookUrl: string | null;
  consumerKey: string | null;
  consumerSecret: string | null;
}

/** 'GetIntegrationProvidersByIdsQuery' query type */
export interface IGetIntegrationProvidersByIdsQueryQuery {
  params: IGetIntegrationProvidersByIdsQueryParams;
  result: IGetIntegrationProvidersByIdsQueryResult;
}

const getIntegrationProvidersByIdsQueryIR: any = {"name":"getIntegrationProvidersByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":52,"b":54,"line":3,"col":8},"used":[{"a":118,"b":120,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT * FROM \"IntegrationProvider\"\nWHERE id in :ids\nAND \"isActive\" = TRUE","loc":{"a":69,"b":142,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationProvider"
 * WHERE id in :ids
 * AND "isActive" = TRUE
 * ```
 */
export const getIntegrationProvidersByIdsQuery = new PreparedQuery<IGetIntegrationProvidersByIdsQueryParams,IGetIntegrationProvidersByIdsQueryResult>(getIntegrationProvidersByIdsQueryIR);


