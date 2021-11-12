/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderWithTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProviderTypesEnum = 'GITLAB' | 'MATTERMOST';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'InsertIntegrationProviderWithTokenQuery' parameters type */
export interface IInsertIntegrationProviderWithTokenQueryParams {
  provider: {
    type: IntegrationProviderTypesEnum | null | void,
    tokenType: IntegrationProviderTokenTypeEnum | null | void,
    scope: IntegrationProviderScopesEnum | null | void,
    name: string | null | void,
    serverBaseUri: string | null | void,
    oauthClientId: string | null | void,
    oauthClientSecret: string | null | void,
    oauthScopes: stringArray | null | void,
    orgId: string | null | void,
    teamId: string | null | void
  };
  teamId: string | null | void;
  userId: string | null | void;
  accessToken: string | null | void;
  expiresAt: Date | null | void;
  oauthRefreshToken: string | null | void;
  oauthScopes: stringArray | null | void;
  attributes: Json | null | void;
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

const insertIntegrationProviderWithTokenQueryIR: any = {"name":"insertIntegrationProviderWithTokenQuery","params":[{"name":"provider","codeRefs":{"defined":{"a":60,"b":67,"line":3,"col":9},"used":[{"a":423,"b":430,"line":17,"col":13}]},"transform":{"type":"pick_tuple","keys":["type","tokenType","scope","name","serverBaseUri","oauthClientId","oauthClientSecret","oauthScopes","orgId","teamId"]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":635,"b":640,"line":28,"col":3}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":646,"b":651,"line":29,"col":3}]}},{"name":"accessToken","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":691,"b":701,"line":31,"col":3}]}},{"name":"expiresAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":707,"b":715,"line":32,"col":3}]}},{"name":"oauthRefreshToken","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":732,"b":748,"line":33,"col":3}]}},{"name":"oauthScopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":754,"b":764,"line":34,"col":3}]}},{"name":"attributes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":781,"b":790,"line":35,"col":3}]}}],"usedParamSet":{"provider":true,"teamId":true,"userId":true,"accessToken":true,"expiresAt":true,"oauthRefreshToken":true,"oauthScopes":true,"attributes":true},"statement":{"body":"WITH providerRow AS (\n   INSERT INTO \"IntegrationProvider\" (\n    \"type\",\n    \"tokenType\",\n    \"scope\",\n    \"name\",\n    \"serverBaseUri\",\n    \"oauthClientId\",\n    \"oauthClientSecret\",\n    \"oauthScopes\",\n    \"orgId\",\n    \"teamId\"\n   ) VALUES :provider RETURNING *\n) INSERT INTO \"IntegrationToken\" (\n  \"teamId\",\n  \"userId\",\n  \"providerId\",\n  \"accessToken\",\n  \"expiresAt\",\n  \"oauthRefreshToken\",\n  \"oauthScopes\",\n  \"attributes\"\n) SELECT * FROM (VALUES (\n  :teamId,\n  :userId,\n  (SELECT \"id\" FROM providerRow),\n  :accessToken,\n  :expiresAt::timestamp,\n  :oauthRefreshToken,\n  :oauthScopes::varchar[],\n  :attributes::jsonb\n)) AS \"integrationToken\"\n  ON CONFLICT (\"providerId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"accessToken\", \"oauthRefreshToken\", \"oauthScopes\", \"providerId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"oauthRefreshToken\",\n    EXCLUDED.\"oauthScopes\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )\n   RETURNING \"providerId\" AS \"id\"","loc":{"a":183,"b":1171,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH providerRow AS (
 *    INSERT INTO "IntegrationProvider" (
 *     "type",
 *     "tokenType",
 *     "scope",
 *     "name",
 *     "serverBaseUri",
 *     "oauthClientId",
 *     "oauthClientSecret",
 *     "oauthScopes",
 *     "orgId",
 *     "teamId"
 *    ) VALUES :provider RETURNING *
 * ) INSERT INTO "IntegrationToken" (
 *   "teamId",
 *   "userId",
 *   "providerId",
 *   "accessToken",
 *   "expiresAt",
 *   "oauthRefreshToken",
 *   "oauthScopes",
 *   "attributes"
 * ) SELECT * FROM (VALUES (
 *   :teamId,
 *   :userId,
 *   (SELECT "id" FROM providerRow),
 *   :accessToken,
 *   :expiresAt::timestamp,
 *   :oauthRefreshToken,
 *   :oauthScopes::varchar[],
 *   :attributes::jsonb
 * )) AS "integrationToken"
 *   ON CONFLICT ("providerId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "isActive", "updatedAt") = (
 *     EXCLUDED."accessToken",
 *     EXCLUDED."oauthRefreshToken",
 *     EXCLUDED."oauthScopes",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 *    RETURNING "providerId" AS "id"
 * ```
 */
export const insertIntegrationProviderWithTokenQuery = new PreparedQuery<IInsertIntegrationProviderWithTokenQueryParams,IInsertIntegrationProviderWithTokenQueryResult>(insertIntegrationProviderWithTokenQueryIR);


