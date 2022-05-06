/** Types generated for queries found in "packages/server/postgres/queries/src/getSharedIntegrationProvidersQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderAuthStrategyEnum = 'oauth1' | 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderScopeEnum = 'global' | 'org' | 'team';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

/** 'GetSharedIntegrationProvidersQuery' parameters type */
export interface IGetSharedIntegrationProvidersQueryParams {
  orgTeamIds: readonly (string | null | void)[];
  teamIds: readonly (string | null | void)[];
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetSharedIntegrationProvidersQuery' return type */
export interface IGetSharedIntegrationProvidersQueryResult {
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
  tenantId: string | null;
}

/** 'GetSharedIntegrationProvidersQuery' query type */
export interface IGetSharedIntegrationProvidersQueryQuery {
  params: IGetSharedIntegrationProvidersQueryParams;
  result: IGetSharedIntegrationProvidersQueryResult;
}

const getSharedIntegrationProvidersQueryIR: any = {"name":"getSharedIntegrationProvidersQuery","params":[{"name":"orgTeamIds","codeRefs":{"defined":{"a":53,"b":62,"line":3,"col":8},"used":[{"a":157,"b":166,"line":7,"col":19}]},"transform":{"type":"array_spread"}},{"name":"teamIds","codeRefs":{"defined":{"a":81,"b":87,"line":4,"col":8},"used":[{"a":254,"b":260,"line":10,"col":39}]},"transform":{"type":"array_spread"}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":185,"b":191,"line":8,"col":17}]}}],"usedParamSet":{"orgTeamIds":true,"service":true,"teamIds":true},"statement":{"body":"SELECT * FROM \"IntegrationProvider\"\nWHERE \"teamId\" in :orgTeamIds\nAND \"service\" = :service\nAND \"isActive\" = TRUE\nAND (\"scope\" != 'team' OR \"teamId\" in :teamIds)","loc":{"a":102,"b":261,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationProvider"
 * WHERE "teamId" in :orgTeamIds
 * AND "service" = :service
 * AND "isActive" = TRUE
 * AND ("scope" != 'team' OR "teamId" in :teamIds)
 * ```
 */
export const getSharedIntegrationProvidersQuery = new PreparedQuery<IGetSharedIntegrationProvidersQueryParams,IGetSharedIntegrationProvidersQueryResult>(getSharedIntegrationProvidersQueryIR);


