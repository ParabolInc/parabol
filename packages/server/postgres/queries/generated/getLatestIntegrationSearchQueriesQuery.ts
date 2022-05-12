/** Types generated for queries found in "packages/server/postgres/queries/src/getLatestIntegrationSearchQueriesQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetLatestIntegrationSearchQueriesQuery' parameters type */
export interface IGetLatestIntegrationSearchQueriesQueryParams {
  teamId: string | null | void;
  userId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetLatestIntegrationSearchQueriesQuery' return type */
export interface IGetLatestIntegrationSearchQueriesQueryResult {
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

/** 'GetLatestIntegrationSearchQueriesQuery' query type */
export interface IGetLatestIntegrationSearchQueriesQueryQuery {
  params: IGetLatestIntegrationSearchQueriesQueryParams;
  result: IGetLatestIntegrationSearchQueriesQueryResult;
}

const getLatestIntegrationSearchQueriesQueryIR: any = {"name":"getLatestIntegrationSearchQueriesQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":110,"b":115,"line":5,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":133,"b":138,"line":6,"col":16}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":157,"b":163,"line":7,"col":17}]}}],"usedParamSet":{"teamId":true,"userId":true,"service":true},"statement":{"body":"SELECT * FROM \"IntegrationSearchQuery\"\nWHERE \"teamId\" = :teamId\nAND \"userId\" = :userId\nAND \"service\" = :service\nAND \"providerId\" IS NULL\nAND \"lastUsedAt\" > NOW() - INTERVAL '60 DAYS'\nORDER BY \"lastUsedAt\" DESC\nLIMIT 5","loc":{"a":53,"b":269,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationSearchQuery"
 * WHERE "teamId" = :teamId
 * AND "userId" = :userId
 * AND "service" = :service
 * AND "providerId" IS NULL
 * AND "lastUsedAt" > NOW() - INTERVAL '60 DAYS'
 * ORDER BY "lastUsedAt" DESC
 * LIMIT 5
 * ```
 */
export const getLatestIntegrationSearchQueriesQuery = new PreparedQuery<IGetLatestIntegrationSearchQueriesQueryParams,IGetLatestIntegrationSearchQueriesQueryResult>(getLatestIntegrationSearchQueriesQueryIR);


