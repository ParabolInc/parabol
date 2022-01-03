/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderWithTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertIntegrationProviderWithTokenQuery' parameters type */
export interface IInsertIntegrationProviderWithTokenQueryParams {
  provider: {
    provider: IntegrationProvidersEnum | null | void,
    type: IntegrationProviderTypesEnum | null | void,
    scope: IntegrationProviderScopesEnum | null | void,
    name: string | null | void,
    providerMetadata: Json | null | void,
    orgId: string | null | void,
    teamId: string | null | void
  };
  userId: string | null | void;
  tokenMetadata: Json | null | void;
}

/** 'InsertIntegrationProviderWithTokenQuery' return type */
export interface IInsertIntegrationProviderWithTokenQueryResult {
  id: number;
}

/** 'InsertIntegrationProviderWithTokenQuery' query type */
export interface IInsertIntegrationProviderWithTokenQueryQuery {
  params: IInsertIntegrationProviderWithTokenQueryParams;
  result: IInsertIntegrationProviderWithTokenQueryResult;
}

const insertIntegrationProviderWithTokenQueryIR: any = {"name":"insertIntegrationProviderWithTokenQuery","params":[{"name":"provider","codeRefs":{"defined":{"a":58,"b":65,"line":3,"col":8},"used":[{"a":338,"b":345,"line":17,"col":5}]},"transform":{"type":"pick_tuple","keys":["provider","type","scope","name","providerMetadata","orgId","teamId"]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":612,"b":617,"line":38,"col":9}]}},{"name":"tokenMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":723,"b":735,"line":45,"col":9}]}}],"usedParamSet":{"provider":true,"userId":true,"tokenMetadata":true},"statement":{"body":"WITH providerRow AS (\n  INSERT INTO\n    \"IntegrationProvider\" (\n      \"provider\",\n      \"type\",\n      \"scope\",\n      \"name\",\n      \"providerMetadata\",\n      \"orgId\",\n      \"teamId\"\n    )\n  VALUES\n    :provider RETURNING *\n)\nINSERT INTO\n  \"IntegrationToken\" (\n    \"teamId\",\n    \"userId\",\n    \"providerId\",\n    \"tokenMetadata\"\n  )\nSELECT\n  *\nFROM\n  (\n    VALUES\n      (\n        (\n          SELECT\n            \"teamId\"\n          FROM\n            providerRow\n        ),\n        :userId,\n        (\n          SELECT\n            \"id\"\n          FROM\n            providerRow\n        ),\n        :tokenMetadata :: jsonb\n      )\n  ) AS \"integrationToken\" ON CONFLICT (\"providerId\", \"userId\", \"teamId\") DO\nUPDATE\nSET\n  (\n    \"tokenMetadata\",\n    \"providerId\",\n    \"isActive\",\n    \"updatedAt\"\n  ) = (\n    EXCLUDED.\"tokenMetadata\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  ) RETURNING \"providerId\" AS \"id\"","loc":{"a":137,"b":1046,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH providerRow AS (
 *   INSERT INTO
 *     "IntegrationProvider" (
 *       "provider",
 *       "type",
 *       "scope",
 *       "name",
 *       "providerMetadata",
 *       "orgId",
 *       "teamId"
 *     )
 *   VALUES
 *     :provider RETURNING *
 * )
 * INSERT INTO
 *   "IntegrationToken" (
 *     "teamId",
 *     "userId",
 *     "providerId",
 *     "tokenMetadata"
 *   )
 * SELECT
 *   *
 * FROM
 *   (
 *     VALUES
 *       (
 *         (
 *           SELECT
 *             "teamId"
 *           FROM
 *             providerRow
 *         ),
 *         :userId,
 *         (
 *           SELECT
 *             "id"
 *           FROM
 *             providerRow
 *         ),
 *         :tokenMetadata :: jsonb
 *       )
 *   ) AS "integrationToken" ON CONFLICT ("providerId", "userId", "teamId") DO
 * UPDATE
 * SET
 *   (
 *     "tokenMetadata",
 *     "providerId",
 *     "isActive",
 *     "updatedAt"
 *   ) = (
 *     EXCLUDED."tokenMetadata",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   ) RETURNING "providerId" AS "id"
 * ```
 */
export const insertIntegrationProviderWithTokenQuery = new PreparedQuery<IInsertIntegrationProviderWithTokenQueryParams,IInsertIntegrationProviderWithTokenQueryResult>(insertIntegrationProviderWithTokenQueryIR);


