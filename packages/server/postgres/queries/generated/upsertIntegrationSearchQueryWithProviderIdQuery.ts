/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationSearchQueryWithProviderIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertIntegrationSearchQueryWithProviderIdQuery' parameters type */
export interface IUpsertIntegrationSearchQueryWithProviderIdQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
  query: Json | null | void;
  providerId: number | null | void;
}

/** 'UpsertIntegrationSearchQueryWithProviderIdQuery' return type */
export type IUpsertIntegrationSearchQueryWithProviderIdQueryResult = void;

/** 'UpsertIntegrationSearchQueryWithProviderIdQuery' query type */
export interface IUpsertIntegrationSearchQueryWithProviderIdQueryQuery {
  params: IUpsertIntegrationSearchQueryWithProviderIdQueryParams;
  result: IUpsertIntegrationSearchQueryWithProviderIdQueryResult;
}

const upsertIntegrationSearchQueryWithProviderIdQueryIR: any = {"name":"upsertIntegrationSearchQueryWithProviderIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":192,"b":197,"line":12,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":205,"b":210,"line":13,"col":5}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":218,"b":224,"line":14,"col":5}]}},{"name":"query","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":232,"b":236,"line":15,"col":5}]}},{"name":"providerId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":244,"b":253,"line":16,"col":5}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true,"query":true,"providerId":true},"statement":{"body":"INSERT INTO \"IntegrationSearchQuery\" (\n    \"userId\",\n    \"teamId\",\n    \"service\",\n    \"query\",\n    \"providerId\"\n  )\nVALUES (\n    :userId,\n    :teamId,\n    :service,\n    :query,\n    :providerId\n) ON CONFLICT (\"userId\", \"teamId\", \"query\", \"service\", \"providerId\") WHERE \"providerId\" IS NOT NULL DO\nUPDATE\nSET (\n    \"updatedAt\",\n    \"lastUsedAt\",\n    \"query\"\n  ) = (\n    CURRENT_TIMESTAMP,\n    CURRENT_TIMESTAMP,\n    EXCLUDED.\"query\"\n  )","loc":{"a":62,"b":495,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationSearchQuery" (
 *     "userId",
 *     "teamId",
 *     "service",
 *     "query",
 *     "providerId"
 *   )
 * VALUES (
 *     :userId,
 *     :teamId,
 *     :service,
 *     :query,
 *     :providerId
 * ) ON CONFLICT ("userId", "teamId", "query", "service", "providerId") WHERE "providerId" IS NOT NULL DO
 * UPDATE
 * SET (
 *     "updatedAt",
 *     "lastUsedAt",
 *     "query"
 *   ) = (
 *     CURRENT_TIMESTAMP,
 *     CURRENT_TIMESTAMP,
 *     EXCLUDED."query"
 *   )
 * ```
 */
export const upsertIntegrationSearchQueryWithProviderIdQuery = new PreparedQuery<IUpsertIntegrationSearchQueryWithProviderIdQueryParams,IUpsertIntegrationSearchQueryWithProviderIdQueryResult>(upsertIntegrationSearchQueryWithProviderIdQueryIR);


