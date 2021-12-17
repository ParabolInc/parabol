/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderWithTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertIntegrationProviderWithTokenQuery' parameters type */
export interface IInsertIntegrationProviderWithTokenQueryParams {
  provider: {
    type: IntegrationProviderTypesEnum | null | void,
    tokenType: IntegrationProviderTokenTypeEnum | null | void,
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

const insertIntegrationProviderWithTokenQueryIR: any = {"name":"insertIntegrationProviderWithTokenQuery","params":[{"name":"provider","codeRefs":{"defined":{"a":60,"b":67,"line":3,"col":9},"used":[{"a":317,"b":324,"line":14,"col":13}]},"transform":{"type":"pick_tuple","keys":["type","tokenType","scope","name","providerMetadata","orgId","teamId"]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":498,"b":503,"line":23,"col":3}]}},{"name":"tokenMetadata","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":543,"b":555,"line":25,"col":3}]}}],"usedParamSet":{"provider":true,"userId":true,"tokenMetadata":true},"statement":{"body":"WITH providerRow AS (\n   INSERT INTO \"IntegrationProvider\" (\n    \"type\",\n    \"tokenType\",\n    \"scope\",\n    \"name\",\n    \"providerMetadata\",\n    \"orgId\",\n    \"teamId\"\n   ) VALUES :provider RETURNING *\n)\nINSERT INTO \"IntegrationToken\" (\n  \"teamId\",\n  \"userId\",\n  \"providerId\",\n  \"tokenMetadata\"\n) SELECT * FROM (VALUES (\n  (SELECT \"teamId\" FROM providerRow),\n  :userId,\n  (SELECT \"id\" FROM providerRow),\n  :tokenMetadata::jsonb\n)) AS \"integrationToken\"\n  ON CONFLICT (\"providerId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"tokenMetadata\", \"providerId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"tokenMetadata\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )\n   RETURNING \"providerId\" AS \"id\"","loc":{"a":139,"b":842,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH providerRow AS (
 *    INSERT INTO "IntegrationProvider" (
 *     "type",
 *     "tokenType",
 *     "scope",
 *     "name",
 *     "providerMetadata",
 *     "orgId",
 *     "teamId"
 *    ) VALUES :provider RETURNING *
 * )
 * INSERT INTO "IntegrationToken" (
 *   "teamId",
 *   "userId",
 *   "providerId",
 *   "tokenMetadata"
 * ) SELECT * FROM (VALUES (
 *   (SELECT "teamId" FROM providerRow),
 *   :userId,
 *   (SELECT "id" FROM providerRow),
 *   :tokenMetadata::jsonb
 * )) AS "integrationToken"
 *   ON CONFLICT ("providerId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("tokenMetadata", "providerId", "isActive", "updatedAt") = (
 *     EXCLUDED."tokenMetadata",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 *    RETURNING "providerId" AS "id"
 * ```
 */
export const insertIntegrationProviderWithTokenQuery = new PreparedQuery<IInsertIntegrationProviderWithTokenQueryParams,IInsertIntegrationProviderWithTokenQueryResult>(insertIntegrationProviderWithTokenQueryIR);


