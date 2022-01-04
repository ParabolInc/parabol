/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderWithTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'InsertIntegrationProviderWithTokenQuery' is invalid, so its result is assigned type 'never' */
export type IInsertIntegrationProviderWithTokenQueryResult = never;

/** Query 'InsertIntegrationProviderWithTokenQuery' is invalid, so its parameters are assigned type 'never' */
export type IInsertIntegrationProviderWithTokenQueryParams = never;

const insertIntegrationProviderWithTokenQueryIR: any = {"name":"insertIntegrationProviderWithTokenQuery","params":[{"name":"provider","codeRefs":{"defined":{"a":58,"b":65,"line":3,"col":8},"used":[{"a":296,"b":303,"line":15,"col":5}]},"transform":{"type":"pick_tuple","keys":["provider","type","scope","providerMetadata","teamId"]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":570,"b":575,"line":36,"col":9}]}},{"name":"tokenMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":681,"b":693,"line":43,"col":9}]}}],"usedParamSet":{"provider":true,"userId":true,"tokenMetadata":true},"statement":{"body":"WITH providerRow AS (\n  INSERT INTO\n    \"IntegrationProvider\" (\n      \"provider\",\n      \"type\",\n      \"scope\",\n      \"providerMetadata\",\n      \"teamId\"\n    )\n  VALUES\n    :provider RETURNING *\n)\nINSERT INTO\n  \"IntegrationToken\" (\n    \"teamId\",\n    \"userId\",\n    \"providerId\",\n    \"tokenMetadata\"\n  )\nSELECT\n  *\nFROM\n  (\n    VALUES\n      (\n        (\n          SELECT\n            \"teamId\"\n          FROM\n            providerRow\n        ),\n        :userId,\n        (\n          SELECT\n            \"id\"\n          FROM\n            providerRow\n        ),\n        :tokenMetadata :: jsonb\n      )\n  ) AS \"integrationToken\" ON CONFLICT (\"providerId\", \"userId\", \"teamId\") DO\nUPDATE\nSET\n  (\n    \"tokenMetadata\",\n    \"providerId\",\n    \"isActive\",\n    \"updatedAt\"\n  ) = (\n    EXCLUDED.\"tokenMetadata\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  ) RETURNING \"providerId\" AS \"id\"","loc":{"a":124,"b":1004,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH providerRow AS (
 *   INSERT INTO
 *     "IntegrationProvider" (
 *       "provider",
 *       "type",
 *       "scope",
 *       "providerMetadata",
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


