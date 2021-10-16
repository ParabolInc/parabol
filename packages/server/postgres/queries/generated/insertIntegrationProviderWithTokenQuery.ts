/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderWithTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'InsertIntegrationProviderWithTokenQuery' parameters type */
export interface IInsertIntegrationProviderWithTokenQueryParams {
  provider: {
    providerType: IntegrationProvidersEnum | null | void,
    providerTokenType: IntegrationProviderTokenTypeEnum | null | void,
    providerScope: IntegrationProviderScopesEnum | null | void,
    name: string | null | void,
    serverBaseUri: string | null | void,
    oauthClientId: string | null | void,
    oauthClientSecret: string | null | void,
    scopes: stringArray | null | void,
    orgId: string | null | void,
    teamId: string | null | void
  };
  teamId: string | null | void;
  userId: string | null | void;
  accessToken: string | null | void;
  expiresAt: Date | null | void;
  oauthRefreshToken: string | null | void;
  scopes: stringArray | null | void;
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

const insertIntegrationProviderWithTokenQueryIR: any = {"name":"insertIntegrationProviderWithTokenQuery","params":[{"name":"provider","codeRefs":{"defined":{"a":60,"b":67,"line":3,"col":9},"used":[{"a":461,"b":468,"line":17,"col":13}]},"transform":{"type":"pick_tuple","keys":["providerType","providerTokenType","providerScope","name","serverBaseUri","oauthClientId","oauthClientSecret","scopes","orgId","teamId"]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":679,"b":684,"line":28,"col":3}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":690,"b":695,"line":29,"col":3}]}},{"name":"accessToken","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":735,"b":745,"line":31,"col":3}]}},{"name":"expiresAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":751,"b":759,"line":32,"col":3}]}},{"name":"oauthRefreshToken","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":776,"b":792,"line":33,"col":3}]}},{"name":"scopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":798,"b":803,"line":34,"col":3}]}},{"name":"attributes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":820,"b":829,"line":35,"col":3}]}}],"usedParamSet":{"provider":true,"teamId":true,"userId":true,"accessToken":true,"expiresAt":true,"oauthRefreshToken":true,"scopes":true,"attributes":true},"statement":{"body":"WITH providerRow AS (\n   INSERT INTO \"IntegrationProvider\" (\n    \"providerType\",\n    \"providerTokenType\",\n    \"providerScope\",\n    \"name\",\n    \"serverBaseUri\",\n    \"oauthClientId\",\n    \"oauthClientSecret\",\n    \"scopes\",\n    \"orgId\",\n    \"teamId\"\n   ) VALUES :provider RETURNING *\n) INSERT INTO \"IntegrationToken\" (\n  \"teamId\",\n  \"userId\",\n  \"integrationProviderId\",\n  \"accessToken\",\n  \"expiresAt\",\n  \"oauthRefreshToken\",\n  \"scopes\",\n  \"attributes\"\n) SELECT * FROM (VALUES (\n  :teamId,\n  :userId,\n  (SELECT \"id\" FROM providerRow),\n  :accessToken,\n  :expiresAt::timestamp,\n  :oauthRefreshToken,\n  :scopes::varchar[],\n  :attributes::jsonb\n)) AS \"integrationToken\"\n  ON CONFLICT (\"integrationProviderId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"accessToken\", \"oauthRefreshToken\", \"scopes\", \"integrationProviderId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"oauthRefreshToken\",\n    EXCLUDED.\"scopes\",\n    EXCLUDED.\"integrationProviderId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )\n   RETURNING \"integrationProviderId\" AS \"id\"","loc":{"a":202,"b":1244,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH providerRow AS (
 *    INSERT INTO "IntegrationProvider" (
 *     "providerType",
 *     "providerTokenType",
 *     "providerScope",
 *     "name",
 *     "serverBaseUri",
 *     "oauthClientId",
 *     "oauthClientSecret",
 *     "scopes",
 *     "orgId",
 *     "teamId"
 *    ) VALUES :provider RETURNING *
 * ) INSERT INTO "IntegrationToken" (
 *   "teamId",
 *   "userId",
 *   "integrationProviderId",
 *   "accessToken",
 *   "expiresAt",
 *   "oauthRefreshToken",
 *   "scopes",
 *   "attributes"
 * ) SELECT * FROM (VALUES (
 *   :teamId,
 *   :userId,
 *   (SELECT "id" FROM providerRow),
 *   :accessToken,
 *   :expiresAt::timestamp,
 *   :oauthRefreshToken,
 *   :scopes::varchar[],
 *   :attributes::jsonb
 * )) AS "integrationToken"
 *   ON CONFLICT ("integrationProviderId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "isActive", "updatedAt") = (
 *     EXCLUDED."accessToken",
 *     EXCLUDED."oauthRefreshToken",
 *     EXCLUDED."scopes",
 *     EXCLUDED."integrationProviderId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 *    RETURNING "integrationProviderId" AS "id"
 * ```
 */
export const insertIntegrationProviderWithTokenQuery = new PreparedQuery<IInsertIntegrationProviderWithTokenQueryParams,IInsertIntegrationProviderWithTokenQueryResult>(insertIntegrationProviderWithTokenQueryIR);


