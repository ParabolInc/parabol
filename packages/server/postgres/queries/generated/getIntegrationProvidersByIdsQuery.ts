/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type stringArray = (string)[];

/** 'GetIntegrationProvidersByIdsQuery' parameters type */
export interface IGetIntegrationProvidersByIdsQueryParams {
  ids: readonly (number | null | void)[];
}

/** 'GetIntegrationProvidersByIdsQuery' return type */
export interface IGetIntegrationProvidersByIdsQueryResult {
  id: number;
  type: IntegrationProviderTypesEnum;
  tokenType: IntegrationProviderTokenTypeEnum;
  scope: IntegrationProviderScopesEnum;
  scopeGlobal: boolean | null;
  orgId: string | null;
  teamId: string | null;
  isActive: boolean;
  name: string;
  serverBaseUri: string;
  oauthScopes: stringArray | null;
  oauthClientId: string | null;
  oauthClientSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 'GetIntegrationProvidersByIdsQuery' query type */
export interface IGetIntegrationProvidersByIdsQueryQuery {
  params: IGetIntegrationProvidersByIdsQueryParams;
  result: IGetIntegrationProvidersByIdsQueryResult;
}

const getIntegrationProvidersByIdsQueryIR: any = {"name":"getIntegrationProvidersByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":54,"b":56,"line":3,"col":9},"used":[{"a":119,"b":121,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT * FROM \"IntegrationProvider\"\nWHERE id in :ids","loc":{"a":70,"b":121,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationProvider"
 * WHERE id in :ids
 * ```
 */
export const getIntegrationProvidersByIdsQuery = new PreparedQuery<IGetIntegrationProvidersByIdsQueryParams,IGetIntegrationProvidersByIdsQueryResult>(getIntegrationProvidersByIdsQueryIR);


