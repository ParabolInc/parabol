/** Types generated for queries found in "packages/server/postgres/queries/src/getLatestIntegrationSearchQueriesWithProviderIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetLatestIntegrationSearchQueriesWithProviderIdQuery' parameters type */
export interface IGetLatestIntegrationSearchQueriesWithProviderIdQueryParams {
  teamId: string | null | void;
  userId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
  providerId: number | null | void;
}

/** 'GetLatestIntegrationSearchQueriesWithProviderIdQuery' return type */
export interface IGetLatestIntegrationSearchQueriesWithProviderIdQueryResult {
  id: number;
  userId: string;
  teamId: string;
  providerId: number | null;
  service: IntegrationProviderServiceEnum;
  query: Json;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 'GetLatestIntegrationSearchQueriesWithProviderIdQuery' query type */
export interface IGetLatestIntegrationSearchQueriesWithProviderIdQueryQuery {
  params: IGetLatestIntegrationSearchQueriesWithProviderIdQueryParams;
  result: IGetLatestIntegrationSearchQueriesWithProviderIdQueryResult;
}

const getLatestIntegrationSearchQueriesWithProviderIdQueryIR: any = {"name":"getLatestIntegrationSearchQueriesWithProviderIdQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":124,"b":129,"line":5,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":147,"b":152,"line":6,"col":16}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":171,"b":177,"line":7,"col":17}]}},{"name":"providerId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":199,"b":208,"line":8,"col":20}]}}],"usedParamSet":{"teamId":true,"userId":true,"service":true,"providerId":true},"statement":{"body":"SELECT * FROM \"IntegrationSearchQuery\"\nWHERE \"teamId\" = :teamId\nAND \"userId\" = :userId\nAND \"service\" = :service\nAND \"providerId\" = :providerId\nAND \"lastUsedAt\" > NOW() - INTERVAL '60 DAYS'\nORDER BY \"lastUsedAt\" DESC\nLIMIT 5","loc":{"a":67,"b":289,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationSearchQuery"
 * WHERE "teamId" = :teamId
 * AND "userId" = :userId
 * AND "service" = :service
 * AND "providerId" = :providerId
 * AND "lastUsedAt" > NOW() - INTERVAL '60 DAYS'
 * ORDER BY "lastUsedAt" DESC
 * LIMIT 5
 * ```
 */
export const getLatestIntegrationSearchQueriesWithProviderIdQuery = new PreparedQuery<IGetLatestIntegrationSearchQueriesWithProviderIdQueryParams,IGetLatestIntegrationSearchQueriesWithProviderIdQueryResult>(getLatestIntegrationSearchQueriesWithProviderIdQueryIR);


