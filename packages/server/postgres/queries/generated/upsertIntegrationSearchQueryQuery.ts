/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationSearchQueryQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertIntegrationSearchQueryQuery' parameters type */
export interface IUpsertIntegrationSearchQueryQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
  query: Json | null | void;
}

/** 'UpsertIntegrationSearchQueryQuery' return type */
export type IUpsertIntegrationSearchQueryQueryResult = void;

/** 'UpsertIntegrationSearchQueryQuery' query type */
export interface IUpsertIntegrationSearchQueryQueryQuery {
  params: IUpsertIntegrationSearchQueryQueryParams;
  result: IUpsertIntegrationSearchQueryQueryResult;
}

const upsertIntegrationSearchQueryQueryIR: any = {"name":"upsertIntegrationSearchQueryQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":160,"b":165,"line":11,"col":5}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":173,"b":178,"line":12,"col":5}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":186,"b":192,"line":13,"col":5}]}},{"name":"query","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":200,"b":204,"line":14,"col":5}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true,"query":true},"statement":{"body":"INSERT INTO \"IntegrationSearchQuery\" (\n    \"userId\",\n    \"teamId\",\n    \"service\",\n    \"query\"\n  )\nVALUES (\n    :userId,\n    :teamId,\n    :service,\n    :query\n) ON CONFLICT (\"userId\", \"teamId\", \"query\", \"service\") WHERE \"providerId\" IS NULL DO\nUPDATE\nSET (\n    \"updatedAt\",\n    \"lastUsedAt\",\n    \"query\"\n  ) = (\n    CURRENT_TIMESTAMP,\n    CURRENT_TIMESTAMP,\n    EXCLUDED.\"query\"\n  )","loc":{"a":48,"b":428,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationSearchQuery" (
 *     "userId",
 *     "teamId",
 *     "service",
 *     "query"
 *   )
 * VALUES (
 *     :userId,
 *     :teamId,
 *     :service,
 *     :query
 * ) ON CONFLICT ("userId", "teamId", "query", "service") WHERE "providerId" IS NULL DO
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
export const upsertIntegrationSearchQueryQuery = new PreparedQuery<IUpsertIntegrationSearchQueryQueryParams,IUpsertIntegrationSearchQueryQueryResult>(upsertIntegrationSearchQueryQueryIR);


