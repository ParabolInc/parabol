/*
  @name insertIntegrationProviderWithTokenQuery
  @param provider -> (type, tokenType, scope, name, serverBaseUri, oauthClientId, oauthClientSecret, oauthScopes, orgId, teamId)
*/
WITH providerRow AS (
   INSERT INTO "IntegrationProvider" (
    "type",
    "tokenType",
    "scope",
    "name",
    "serverBaseUri",
    "oauthClientId",
    "oauthClientSecret",
    "oauthScopes",
    "orgId",
    "teamId"
   ) VALUES :provider RETURNING *
) INSERT INTO "IntegrationToken" (
  "teamId",
  "userId",
  "providerId",
  "accessToken",
  "expiresAt",
  "oauthRefreshToken",
  "oauthScopes",
  "attributes"
) SELECT * FROM (VALUES (
  :teamId,
  :userId,
  (SELECT "id" FROM providerRow),
  :accessToken,
  :expiresAt::timestamp,
  :oauthRefreshToken,
  :oauthScopes::varchar[],
  :attributes::jsonb
)) AS "integrationToken"
  ON CONFLICT ("providerId", "userId", "teamId")
  DO UPDATE
  SET ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "isActive", "updatedAt") = (
    EXCLUDED."accessToken",
    EXCLUDED."oauthRefreshToken",
    EXCLUDED."oauthScopes",
    EXCLUDED."providerId",
    TRUE,
    CURRENT_TIMESTAMP
  )
   RETURNING "providerId" AS "id";